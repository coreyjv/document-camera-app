import {createContext, use, useReducer, useEffect, useCallback, useMemo} from "react";
import type { ReactNode } from "react";

interface CameraProviderProps { children: ReactNode };

interface Camera {
    id: typeof MediaDeviceInfo.prototype['deviceId'], name: string
}

interface CameraSettings {
    angle: number,
    zoom: number
}

interface CameraState {
    cameras: Camera[],
    isInitializingCameraList: boolean,
    currentCamera?: Camera,
    cameraSettings: Record<Camera["id"], CameraSettings>
}

type CameraRotationDirection = 'cw' | 'ccw'

type CameraAction = { type: 'update-camera-list', data: { cameras: MediaDeviceInfo[] } }
    | { type: 'initializing-camera-list' }
    | { type: 'initial-camera-list', data: { cameras: MediaDeviceInfo[] } }
    | { type: 'select-camera', data: { id: typeof MediaDeviceInfo.prototype['deviceId'] } }
    | { type: 'rotate-camera', data: { direction: CameraRotationDirection } }
    | { type: 'zoom-camera', data: { step: number } }
    | { type: 'reset-zoom-camera' }

interface CameraContext {
    cameras: CameraState['cameras'],
    currentCamera?: CameraState['currentCamera'],
    cameraSettings: CameraState['cameraSettings'],
    rotate: ({ direction }: { direction: CameraRotationDirection }) => void,
    zoom: ({ step }: { step: number }) => void,
    resetZoom: () => void,
    selectCamera: ({ id }: { id: typeof MediaDeviceInfo.prototype['deviceId'] }) => void,
}

const CameraContext = createContext<CameraContext | undefined>(undefined)

function cameraReducer(state: CameraState, action: CameraAction) {
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

            if (currentCamera) {
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

            return state
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
    }
}

function CameraProvider({children}: CameraProviderProps) {
    const [state, dispatch] = useReducer(cameraReducer, {
        cameras: [],
        isInitializingCameraList: false,
        currentCamera: undefined,
        cameraSettings: {}
    })

    function handleDeviceChange() {
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

        void fetchCameras()

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
        }

    }, []);

    const rotate = useCallback<CameraContext['rotate']>(({ direction }) => {
        dispatch({type: 'rotate-camera', data: {direction}})
    }, [dispatch])

    const selectCamera = useCallback<CameraContext['selectCamera']>(({id}) => {
        dispatch({type: 'select-camera', data: {id}})
    }, [dispatch])

    const zoom = useCallback<CameraContext['zoom']>(({step}) => {
        dispatch({ type: 'zoom-camera', data: { step }})
    }, [dispatch])

    const resetZoom = useCallback<CameraContext['resetZoom']>(() => {
        dispatch({ type: 'reset-zoom-camera' })
    }, [dispatch])

    const value = useMemo(() => ({
        cameras: state.cameras, currentCamera: state.currentCamera, cameraSettings: state.cameraSettings,
        rotate, selectCamera, zoom, resetZoom
    }), [state.cameras, state.currentCamera, state.cameraSettings, zoom, resetZoom, selectCamera, rotate]);

    return <CameraContext value={value}>{children}</CameraContext>
}

function useCamera() {
    const context = use(CameraContext)
    if (context === undefined) {
        throw new Error('useCount must be used within a CameraContext')
    }
    return context
}

// eslint-disable-next-line react-refresh/only-export-components
export { CameraProvider, useCamera }