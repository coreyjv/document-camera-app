import { createContext, use, useReducer, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { cameraReducer, type CameraRotationDirection, type CameraState } from './camera-reducer.ts'
import { useLocalStorage } from './use-local-storage.ts'

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
}

const CameraContext = createContext<CameraContext | undefined>(undefined)

function CameraProvider({ children }: CameraProviderProps) {
  const [storedState, setStoredState] = useLocalStorage<{
    lastUsedCamera: (typeof MediaDeviceInfo.prototype)['deviceId'] | undefined
  }>('doccam', { lastUsedCamera: undefined })

  const [state, dispatch] = useReducer(cameraReducer, {
    cameras: [],
    isInitializingCameraList: false,
    currentCamera: undefined,
    cameraSettings: {}
  })

  function handleDeviceChange() {
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
  }

  const fetchCameras = useCallback(async () => {
    try {
      // Request user permission.
      await navigator.mediaDevices.getUserMedia({ video: true })

      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')

      dispatch({ type: 'initial-camera-list', data: { cameras, lastUsedCamera: storedState.lastUsedCamera } })
    } catch (e) {
      // TODO error handling, permissins, etc.
      console.error(e)
    }
  }, [storedState.lastUsedCamera])

  useEffect(() => {
    dispatch({ type: 'initializing-camera-list' })

    void fetchCameras()

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [fetchCameras])

  const rotate = useCallback<CameraContext['rotate']>(
    ({ direction }) => {
      dispatch({ type: 'rotate-camera', data: { direction } })
    },
    [dispatch]
  )

  const selectCamera = useCallback<CameraContext['selectCamera']>(
    ({ id }) => {
      dispatch({ type: 'select-camera', data: { id } })

      setStoredState({ ...storedState, lastUsedCamera: id })
    },
    [setStoredState, storedState]
  )

  const zoom = useCallback<CameraContext['zoom']>(
    ({ step }) => {
      dispatch({ type: 'zoom-camera', data: { step } })
    },
    [dispatch]
  )

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
      zoom,
      resetZoom
    }),
    [state.cameras, state.currentCamera, state.cameraSettings, zoom, resetZoom, selectCamera, rotate]
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
