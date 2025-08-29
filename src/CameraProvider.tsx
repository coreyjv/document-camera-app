import {createContext, useContext, useReducer, useEffect, type ReactNode, useCallback} from "react";

const CameraContext = createContext()

function cameraReducer(state, action) {
    console.log({state, action});
    switch (action.type) {
        case 'update-camera-list':
        case 'initializing-camera-list':
            return {
                ...state,
                isInitializingCameraList: true,
            }
        case 'initial-camera-list':
            return {
                ...state,
                isInitializingCameraList: false,
                cameras: action.data.cameras.map(camera => ({id: camera.deviceId, name: camera.label}))
            }
        case 'select-camera': {
            const currentCamera = state.cameras.find(camera => camera.id === action.data.id);
            return {
                ...state,
                currentCamera,
                cameraSettings: {
                    ...state.cameraSettings,
                    [currentCamera.id]: {
                        angle: 0,
                        zoom: 1
                    }
                }
            }
        }
        case 'rotate-camera': {
            if (state.currentCamera) {
                return {
                    ...state,
                    cameraSettings: {
                        ...state.cameraSettings,
                        [state.currentCamera.id]: {
                            ...state.cameraSettings[state.currentCamera.id],
                            angle: ((action.data.direction === 'cw' ? 1 : -1) * 90 + state.cameraSettings[state.currentCamera.id].angle) % 360
                        }
                    }
                }
            }

            return state
        }
        case 'zoom-camera': {
            if (state.currentCamera) {
                const currentZoom = state.cameraSettings[state.currentCamera.id].zoom
                let newZoom

                if (action.data.step > 0) {
                    newZoom = Math.min(4, currentZoom + action.data.step)
                } else {
                    newZoom = Math.max(1, currentZoom + action.data.step)
                }
                return {
                    ...state,
                    cameraSettings: {
                        ...state.cameraSettings,
                        [state.currentCamera.id]: {
                            ...state.cameraSettings[state.currentCamera.id],
                            zoom: newZoom
                        }
                    }
                }
            }

            return state
        }
        case 'reset-zoom-camera': {
            if (state.currentCamera) {
                return {
                    ...state,
                    cameraSettings: {
                        ...state.cameraSettings,
                        [state.currentCamera.id]: {
                            ...state.cameraSettings[state.currentCamera.id],
                            zoom: 1
                        }
                    }
                }
            }

            return state
        }
        default:
            console.error(`Unknown action type ${action.type}`);
    }
}

function CameraProvider({children}: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cameraReducer, {
        cameras: [],
        isInitializingCameraList: false,
        currentCamera: undefined,
        cameraSettings: {}
    })

    async function handleDeviceChange() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const cameras = devices.filter(device => device.kind === 'videoinput')

            dispatch({type: 'update-camera-list', data: {cameras}})
        } catch (e) {
            // TODO error handling, permissins, etc.
            console.error(e)
        }
    }

    async function fetchCameras() {
        try {
            // Request user permission.
            await navigator.mediaDevices.getUserMedia({video: true});

            const devices = await navigator.mediaDevices.enumerateDevices()
            const cameras = devices.filter(device => device.kind === 'videoinput')

            dispatch({type: 'initial-camera-list', data: {cameras}})
        } catch (e) {
            // TODO error handling, permissins, etc.
            console.error(e)
        }
    }

    useEffect(() => {
        dispatch({type: 'initializing-camera-list'})

        fetchCameras()

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
        }

    }, []);

    const rotate = useCallback(({direction}) => {
        dispatch({type: 'rotate-camera', data: {direction}})
    })

    const selectCamera = useCallback(({id}) => {
        dispatch({type: 'select-camera', data: {id}})
    })

    const zoom = useCallback(({step}) => {
        dispatch({ type: 'zoom-camera', data: { step }})
    })

    const resetZoom = useCallback(() => {
        dispatch({ type: 'reset-zoom-camera' })
    })

    const value = {
        cameras: state.cameras, currentCamera: state.currentCamera, cameraSettings: state.cameraSettings,
        rotate, selectCamera, zoom, resetZoom
    };

    return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>
}

function useCamera() {
    const context = useContext(CameraContext)
    if (context === undefined) {
        throw new Error('useCount must be used within a CameraContext')
    }
    return context
}

export {CameraProvider, useCamera}
