interface Camera {
  id: (typeof MediaDeviceInfo.prototype)['deviceId']
  name: string
}

interface CameraSettings {
  angle: number
  zoom: number
}

export interface CameraState {
  cameras: Camera[]
  isInitializingCameraList: boolean
  currentCamera?: Camera
  cameraSettings: Record<Camera['id'], CameraSettings>
}

export type CameraRotationDirection = 'cw' | 'ccw'

export type CameraAction =
  | { type: 'updating-camera-list'; data: { cameras: Pick<MediaDeviceInfo, 'deviceId' | 'label'>[] } }
  | { type: 'initializing-camera-list' }
  | {
      type: 'initial-camera-list'
      data: {
        cameras: Pick<MediaDeviceInfo, 'deviceId' | 'label'>[]
        lastUsedCamera?: (typeof MediaDeviceInfo.prototype)['deviceId']
      }
    }
  | { type: 'select-camera'; data: { id: (typeof MediaDeviceInfo.prototype)['deviceId'] } }
  | { type: 'rotate-camera'; data: { direction: CameraRotationDirection } }
  | { type: 'zoom-camera'; data: { step: number } }
  | { type: 'reset-zoom-camera' }

export function cameraReducer(state: CameraState, action: CameraAction) {
  switch (action.type) {
    case 'initializing-camera-list':
      return {
        ...state,
        isInitializingCameraList: true
      }
    case 'updating-camera-list':
      if (state.currentCamera !== undefined) {
        const currentCamera = state.cameras.find(camera => camera.id === state.currentCamera?.id)

        if (currentCamera !== undefined) {
          // TODO filter out camera settings?
          return {
            ...state,
            isInitializingCameraList: false,
            currentCamera: undefined,
            cameras: action.data.cameras.map(camera => ({ id: camera.deviceId, name: camera.label }))
          }
        }
      }
      return {
        ...state,
        isInitializingCameraList: false,
        cameras: action.data.cameras.map(camera => ({ id: camera.deviceId, name: camera.label }))
      }
    case 'initial-camera-list':
      if (action.data.lastUsedCamera !== undefined) {
        const currentCamera = action.data.cameras.find(camera => camera.deviceId === action.data.lastUsedCamera)

        if (currentCamera) {
          return {
            ...state,
            isInitializingCameraList: false,
            cameras: action.data.cameras.map(camera => ({ id: camera.deviceId, name: camera.label })),
            currentCamera: { id: currentCamera.deviceId, name: currentCamera.label },
            cameraSettings: {
              ...state.cameraSettings,
              [currentCamera.deviceId]: {
                angle: 0,
                zoom: 1
              }
            }
          }
        }
      }

      return {
        ...state,
        isInitializingCameraList: false,
        cameras: action.data.cameras.map(camera => ({ id: camera.deviceId, name: camera.label }))
      }
    case 'select-camera': {
      const currentCamera = state.cameras.find(camera => camera.id === action.data.id)

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
              angle:
                ((action.data.direction === 'cw' ? 1 : -1) * 90 + state.cameraSettings[state.currentCamera.id].angle) %
                360
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
