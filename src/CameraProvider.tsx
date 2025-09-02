import { createContext, use, useReducer, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { cameraReducer, type CameraRotationDirection, type CameraState } from './camera-reducer.ts'

interface CameraProviderProps {
  children: ReactNode
}

interface CameraContext {
  cameras: CameraState['cameras']
  currentCamera?: CameraState['currentCamera']
  cameraSettings: CameraState['cameraSettings']
  rotate: ({ direction }: { direction: CameraRotationDirection }) => void
  zoom: ({ step }: { step: number }) => void
  resetZoom: () => void
  selectCamera: ({ id }: { id: (typeof MediaDeviceInfo.prototype)['deviceId'] }) => void
  toggleCamera: ({ id }: { id: (typeof MediaDeviceInfo.prototype)['deviceId'] }) => void
}

const SETTINGS_KEY = 'cameraSettings'

const CameraContext = createContext<CameraContext | undefined>(undefined)

function CameraProvider({ children }: CameraProviderProps) {
  const [state, dispatch] = useReducer(
    cameraReducer,
    {
      cameras: [],
      disabledCameras: [],
      isInitializingCameraList: false,
      currentCamera: undefined,
      cameraSettings: {}
    },
    (init): CameraState => {
      const store = localStorage.getItem(SETTINGS_KEY)

      if (store) {
        const storedState = JSON.parse(store) as Pick<
          CameraState,
          'lastUsedCamera' | 'cameraSettings' | 'disabledCameras'
        >
        return {
          ...storedState,
          // because it may not have previously been stored in local storage
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          disabledCameras: storedState.disabledCameras ?? [],
          cameras: [],
          isInitializingCameraList: false,
          currentCamera: undefined
        }
      }

      return init
    }
  )

  const fetchCameras = useCallback(async () => {
    try {
      // Request user permission.
      await navigator.mediaDevices.getUserMedia({ video: true })

      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')

      dispatch({ type: 'initial-camera-list', data: { cameras } })
    } catch (e) {
      // TODO error handling, permissins, etc.
      console.error(e)
    }
  }, [])

  useEffect(() => {
    dispatch({ type: 'initializing-camera-list' })

    void fetchCameras()

    const controller = new AbortController()

    navigator.mediaDevices.addEventListener(
      'devicechange',
      () => {
        navigator.mediaDevices
          .enumerateDevices()
          .then(devices => {
            const cameras = devices.filter(device => device.kind === 'videoinput')

            dispatch({ type: 'updating-camera-list', data: { cameras } })
          })
          .catch((error: unknown) => {
            // TODO error handling, permissins, etc.
            console.error(error)
          })
      },
      { signal: controller.signal }
    )

    return void controller.abort
  }, [fetchCameras])

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        lastUsedCamera: state.lastUsedCamera,
        cameraSettings: state.cameraSettings,
        disabledCameras: state.disabledCameras
      })
    )
  }, [state])

  const rotate = useCallback<CameraContext['rotate']>(({ direction }) => {
    dispatch({ type: 'rotate-camera', data: { direction } })
  }, [])

  const selectCamera = useCallback<CameraContext['selectCamera']>(({ id }) => {
    dispatch({ type: 'select-camera', data: { id } })
  }, [])

  const zoom = useCallback<CameraContext['zoom']>(({ step }) => {
    dispatch({ type: 'zoom-camera', data: { step } })
  }, [])

  const toggleCamera = useCallback<CameraContext['toggleCamera']>(({ id }) => {
    dispatch({ type: 'toggle-camera', data: { id } })
  }, [])

  const resetZoom = useCallback<CameraContext['resetZoom']>(() => {
    dispatch({ type: 'reset-zoom-camera' })
  }, [dispatch])

  const value = useMemo(
    () => ({
      cameras: state.cameras,
      currentCamera: state.currentCamera,
      cameraSettings: state.cameraSettings,
      rotate,
      selectCamera,
      toggleCamera,
      zoom,
      resetZoom
    }),
    [state.cameras, state.currentCamera, state.cameraSettings, zoom, resetZoom, selectCamera, toggleCamera, rotate]
  )

  if (!state.isInitializingCameraList && state.cameras.length === 0) {
    return (
      <div>
        <p>Please connect a camera</p>
      </div>
    )
  }

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
