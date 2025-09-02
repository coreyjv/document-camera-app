interface Camera {
  id: (typeof MediaDeviceInfo.prototype)['deviceId']
  name: string
  enabled: boolean
}

interface CameraSettings {
  angle: number
  zoom: number
}

export interface CameraState {
  cameras: Camera[]
  disabledCameras: Camera['id'][]
  isInitializingCameraList: boolean
  lastUsedCamera?: Camera['id']
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
      }
    }
  | { type: 'select-camera'; data: { id: (typeof MediaDeviceInfo.prototype)['deviceId'] } }
  | { type: 'toggle-camera'; data: { id: (typeof MediaDeviceInfo.prototype)['deviceId'] } }
  | { type: 'rotate-camera'; data: { direction: CameraRotationDirection } }
  | { type: 'zoom-camera'; data: { step: number } }
  | { type: 'reset-zoom-camera' }

export function cameraReducer(state: CameraState, action: CameraAction): CameraState {
  switch (action.type) {
    case 'initializing-camera-list':
      return {
        ...state,
        isInitializingCameraList: true
      }
    case 'updating-camera-list':
      if (state.currentCamera !== undefined) {
        const currentCamera = state.cameras.find(camera => camera.id === state.currentCamera?.id)

        const lastCamera = action.data.cameras.find(camera => camera.deviceId === state.lastUsedCamera)

        if (lastCamera !== undefined) {
          return {
            ...state,
            isInitializingCameraList: false,
            currentCamera: {
              id: lastCamera.deviceId,
              name: lastCamera.label,
              enabled: true
            },
            cameras: action.data.cameras.map(camera => ({
              id: camera.deviceId,
              name: camera.label,
              enabled: !state.disabledCameras.some(disabledCamera => disabledCamera === camera.deviceId)
            }))
          }
        }

        if (currentCamera !== undefined) {
          // TODO filter out camera settings?
          return {
            ...state,
            isInitializingCameraList: false,
            currentCamera: undefined,
            cameras: action.data.cameras.map(camera => ({
              id: camera.deviceId,
              name: camera.label,
              enabled: !state.disabledCameras.some(disabledCamera => disabledCamera === camera.deviceId)
            }))
          }
        }
      }

      return {
        ...state,
        isInitializingCameraList: false,
        cameras: action.data.cameras.map(camera => ({
          id: camera.deviceId,
          name: camera.label,
          enabled: !state.disabledCameras.some(disabledCamera => disabledCamera === camera.deviceId)
        }))
      }
    case 'initial-camera-list':
      if (state.lastUsedCamera !== undefined) {
        const currentCamera = action.data.cameras.find(camera => camera.deviceId === state.lastUsedCamera)

        if (currentCamera) {
          return {
            ...state,
            isInitializingCameraList: false,
            cameras: action.data.cameras.map(camera => ({
              id: camera.deviceId,
              name: camera.label,
              enabled: !state.disabledCameras.some(disabledCamera => disabledCamera === camera.deviceId)
            })),
            currentCamera: { id: currentCamera.deviceId, name: currentCamera.label, enabled: true },
            cameraSettings: {
              ...state.cameraSettings,
              [currentCamera.deviceId]: {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                angle: state.cameraSettings[currentCamera.deviceId]?.angle ?? 0,
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                zoom: state.cameraSettings[currentCamera.deviceId]?.zoom ?? 1
              }
            }
          }
        }
      }

      return {
        ...state,
        isInitializingCameraList: false,
        cameras: action.data.cameras.map(camera => ({
          id: camera.deviceId,
          name: camera.label,
          enabled: !state.disabledCameras.some(disabledCamera => disabledCamera === camera.deviceId)
        }))
      }
    case 'select-camera': {
      const currentCamera = state.cameras.find(camera => camera.id === action.data.id)

      if (currentCamera) {
        if (!currentCamera.enabled) {
          return state
        }
        return {
          ...state,
          currentCamera,
          lastUsedCamera: currentCamera.id,
          cameraSettings: {
            ...state.cameraSettings,
            [currentCamera.id]: {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              angle: state.cameraSettings[currentCamera.id]?.angle ?? 0,
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              zoom: state.cameraSettings[currentCamera.id]?.zoom ?? 1
            }
          }
        }
      }

      return state
    }
    case 'toggle-camera': {
      if (state.currentCamera?.id === action.data.id) {
        // We do not want to allow toggling of currently displayed camera.
        return state
      }

      const updatedCameras = state.cameras.map(cam => {
        if (cam.id === action.data.id) {
          return {
            ...cam,
            enabled: !cam.enabled
          }
        }

        return cam
      })

      return {
        ...state,
        cameras: updatedCameras,
        disabledCameras: updatedCameras.filter(camera => !camera.enabled).map(camera => camera.id)
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
