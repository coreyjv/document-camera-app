import { expect, describe, test } from 'vitest'
import { cameraReducer, type CameraRotationDirection } from './camera-reducer.ts'

describe('camera-reducer', () => {
  const defaultState = {
    disabledCameras: [],
    cameras: [],
    isInitializingCameraList: false,
    currentCamera: undefined,
    cameraSettings: {}
  }

  describe('initializing camera list', () => {
    test('When initializing camera list isInitializingCameraList should be true', () => {
      const updatedState = cameraReducer(defaultState, { type: 'initializing-camera-list' })

      expect(updatedState.isInitializingCameraList).toBe(true)
    })
  })

  describe('updating camera list', () => {
    test('When updating camera list isInitializingCameraList should be false and state should reflect new cameras', () => {
      const currentState = {
        ...defaultState,
        cameras: [
          { id: 'id-1', name: 'camera-1', enabled: true },
          { id: 'id-2', name: 'camera-2', enabled: true }
        ],
        isInitializingCameraList: true
      }

      const newCameras = [
        { deviceId: 'id-3', label: 'camera-3' },
        { deviceId: 'id-4', label: 'camera-4' }
      ]

      const updatedState = cameraReducer(currentState, { type: 'updating-camera-list', data: { cameras: newCameras } })

      expect(updatedState.isInitializingCameraList).toBe(false)
      expect(updatedState.cameras).toEqual(
        expect.arrayContaining([
          { id: newCameras[0].deviceId, name: newCameras[0].label, enabled: true },
          { id: newCameras[1].deviceId, name: newCameras[1].label, enabled: true }
        ])
      )
    })

    test('When the camera list updates and the current camera is no longer connected set current camera to undefined', () => {
      const currentState = {
        ...defaultState,
        cameras: [
          { id: 'id-1', name: 'camera-1', enabled: true },
          { id: 'id-2', name: 'camera-2', enabled: true }
        ],
        currentCamera: { id: 'id-1', name: 'camera-1', enabled: true },
        cameraSettings: {
          'id-1': {
            angle: 0,
            zoom: 1
          }
        },
        isInitializingCameraList: true
      }

      const newCameras = [
        { deviceId: 'id-3', label: 'camera-3' },
        { deviceId: 'id-4', label: 'camera-4' }
      ]

      const updatedState = cameraReducer(currentState, {
        type: 'updating-camera-list',
        data: { cameras: newCameras }
      })

      expect(updatedState.isInitializingCameraList).toBe(false)
      expect(updatedState.currentCamera).toBeUndefined()
      expect(updatedState.cameras).toEqual(
        expect.arrayContaining([
          { id: newCameras[0].deviceId, name: newCameras[0].label, enabled: true },
          { id: newCameras[1].deviceId, name: newCameras[1].label, enabled: true }
        ])
      )
    })

    test('When the camera list updates and last used camera is connected change to that.', () => {
      const currentState = {
        ...defaultState,
        lastUsedCamera: 'id-3',
        cameras: [
          { id: 'id-1', name: 'camera-1', enabled: true },
          { id: 'id-2', name: 'camera-2', enabled: true }
        ],
        currentCamera: { id: 'id-1', name: 'camera-1', enabled: true },
        cameraSettings: {
          'id-1': {
            angle: 0,
            zoom: 1
          }
        },
        isInitializingCameraList: true
      }

      const newCameras = [
        { deviceId: 'id-3', label: 'camera-3' },
        { deviceId: 'id-4', label: 'camera-4' }
      ]

      const updatedState = cameraReducer(currentState, {
        type: 'updating-camera-list',
        data: { cameras: newCameras }
      })

      expect(updatedState.isInitializingCameraList).toBe(false)
      expect(updatedState.currentCamera?.id).toEqual(newCameras[0].deviceId)
      expect(updatedState.cameras).toEqual(
        expect.arrayContaining([
          { id: newCameras[0].deviceId, name: newCameras[0].label, enabled: true },
          { id: newCameras[1].deviceId, name: newCameras[1].label, enabled: true }
        ])
      )
    })

    test('When the camera list updates and last used camera is connected ensure disabled cameras are mapped properly', () => {
      const currentState = {
        ...defaultState,
        lastUsedCamera: 'id-3',
        disabledCameras: ['id-4'],
        cameras: [
          { id: 'id-1', name: 'camera-1', enabled: true },
          { id: 'id-2', name: 'camera-2', enabled: true }
        ],
        currentCamera: { id: 'id-1', name: 'camera-1', enabled: true },
        cameraSettings: {
          'id-1': {
            angle: 0,
            zoom: 1
          }
        },
        isInitializingCameraList: true
      }

      const newCameras = [
        { deviceId: 'id-3', label: 'camera-3' },
        { deviceId: 'id-4', label: 'camera-4' }
      ]

      const updatedState = cameraReducer(currentState, {
        type: 'updating-camera-list',
        data: { cameras: newCameras }
      })

      expect(updatedState.isInitializingCameraList).toBe(false)
      expect(updatedState.currentCamera?.id).toEqual(newCameras[0].deviceId)
      expect(updatedState.cameras).toEqual(
        expect.arrayContaining([
          { id: newCameras[0].deviceId, name: newCameras[0].label, enabled: true },
          { id: newCameras[1].deviceId, name: newCameras[1].label, enabled: false }
        ])
      )
    })

    test('When the camera list updates and last used camera is not connected ensure disabled cameras are mapped properly', () => {
      const currentState = {
        ...defaultState,
        disabledCameras: ['id-4'],
        cameras: [
          { id: 'id-1', name: 'camera-1', enabled: true },
          { id: 'id-2', name: 'camera-2', enabled: true }
        ],
        currentCamera: { id: 'id-1', name: 'camera-1', enabled: true },
        cameraSettings: {
          'id-1': {
            angle: 0,
            zoom: 1
          }
        },
        isInitializingCameraList: true
      }

      const newCameras = [
        { deviceId: 'id-3', label: 'camera-3' },
        { deviceId: 'id-4', label: 'camera-4' }
      ]

      const updatedState = cameraReducer(currentState, {
        type: 'updating-camera-list',
        data: { cameras: newCameras }
      })

      expect(updatedState.isInitializingCameraList).toBe(false)
      expect(updatedState.currentCamera).toBeUndefined()
      expect(updatedState.cameras).toEqual(
        expect.arrayContaining([
          { id: newCameras[0].deviceId, name: newCameras[0].label, enabled: true },
          { id: newCameras[1].deviceId, name: newCameras[1].label, enabled: false }
        ])
      )
    })
  })

  describe('initial camera list', () => {
    test('When the initial camera list is fetched if the last camera that was used exists make it the current camera', () => {
      const currentState = {
        ...defaultState,
        lastUsedCamera: 'id-2',
        cameras: [],
        isInitializingCameraList: true
      }

      const newCameras = [
        { deviceId: 'id-1', label: 'camera-1' },
        { deviceId: 'id-2', label: 'camera-2' }
      ]

      const updatedState = cameraReducer(currentState, {
        type: 'initial-camera-list',
        data: { cameras: newCameras }
      })

      expect(updatedState.isInitializingCameraList).toBe(false)
      expect(updatedState.currentCamera?.id).toEqual(newCameras[1].deviceId)
      expect(updatedState.cameraSettings[currentState.lastUsedCamera]).toEqual({ angle: 0, zoom: 1 })
      expect(updatedState.cameras).toEqual(
        expect.arrayContaining([
          { id: newCameras[0].deviceId, name: newCameras[0].label, enabled: true },
          { id: newCameras[1].deviceId, name: newCameras[1].label, enabled: true }
        ])
      )
    })

    test('When the initial camera list is fetched ensure currentCamera is null if lastUsedCamera is undefined', () => {
      const currentState = {
        ...defaultState,
        cameras: [],
        isInitializingCameraList: true
      }

      const newCameras = [
        { deviceId: 'id-1', label: 'camera-1' },
        { deviceId: 'id-2', label: 'camera-2' }
      ]

      const updatedState = cameraReducer(currentState, {
        type: 'initial-camera-list',
        data: { cameras: newCameras }
      })

      expect(updatedState.isInitializingCameraList).toBe(false)
      expect(updatedState.currentCamera).toBeUndefined()
      expect(updatedState.cameras).toEqual(
        expect.arrayContaining([
          { id: newCameras[0].deviceId, name: newCameras[0].label, enabled: true },
          { id: newCameras[1].deviceId, name: newCameras[1].label, enabled: true }
        ])
      )
    })

    test('When the initial camera list is fetched ensure that disabled cameras are properly mapped', () => {
      const currentState = {
        ...defaultState,
        disabledCameras: ['id-2'],
        cameras: [],
        isInitializingCameraList: true
      }

      const newCameras = [
        { deviceId: 'id-1', label: 'camera-1' },
        { deviceId: 'id-2', label: 'camera-2' }
      ]

      const updatedState = cameraReducer(currentState, {
        type: 'initial-camera-list',
        data: { cameras: newCameras }
      })

      expect(updatedState.isInitializingCameraList).toBe(false)
      expect(updatedState.currentCamera).toBeUndefined()
      expect(updatedState.cameras).toEqual(
        expect.arrayContaining([
          { id: newCameras[0].deviceId, name: newCameras[0].label, enabled: true },
          { id: newCameras[1].deviceId, name: newCameras[1].label, enabled: false }
        ])
      )
    })

    test('When the initial camera list is fetched if the last camera that was used exists ensure disabled cameras are properly mapped', () => {
      const currentState = {
        ...defaultState,
        disabledCameras: ['id-2'],
        lastUsedCamera: 'id-2',
        cameras: [],
        isInitializingCameraList: true
      }

      const newCameras = [
        { deviceId: 'id-1', label: 'camera-1' },
        { deviceId: 'id-2', label: 'camera-2' }
      ]

      const updatedState = cameraReducer(currentState, {
        type: 'initial-camera-list',
        data: { cameras: newCameras }
      })

      expect(updatedState.isInitializingCameraList).toBe(false)
      expect(updatedState.currentCamera?.id).toEqual(newCameras[1].deviceId)
      expect(updatedState.cameraSettings[currentState.lastUsedCamera]).toEqual({ angle: 0, zoom: 1 })
      expect(updatedState.cameras).toEqual(
        expect.arrayContaining([
          { id: newCameras[0].deviceId, name: newCameras[0].label, enabled: true },
          { id: newCameras[1].deviceId, name: newCameras[1].label, enabled: false }
        ])
      )
    })
  })

  describe('select camera', () => {
    test('When selecting a camera and it does not exist in the list do not change state', () => {
      const updatedState = cameraReducer(defaultState, { type: 'select-camera', data: { id: 'does-not-exist' } })

      expect(updatedState).toStrictEqual(defaultState)
    })

    test('When selecting a camera and it exists set it as the current camera', () => {
      const stateWithCameras = {
        ...defaultState,
        cameras: [
          { id: 'id-1', name: 'camera-1', enabled: true },
          { id: 'id-2', name: 'camera-2', enabled: true }
        ]
      }

      const updatedState = cameraReducer(stateWithCameras, { type: 'select-camera', data: { id: 'id-1' } })

      expect(updatedState.currentCamera).toStrictEqual(stateWithCameras.cameras[0])
    })

    test('When selecting a camera and it exists default its settings', () => {
      const stateWithCameras = {
        ...defaultState,
        cameras: [
          { id: 'id-1', name: 'camera-1', enabled: true },
          { id: 'id-2', name: 'camera-2', enabled: true }
        ]
      }

      const selectedCamera = 'id-1'
      const updatedState = cameraReducer(stateWithCameras, { type: 'select-camera', data: { id: selectedCamera } })

      expect(updatedState.cameraSettings[selectedCamera]).toEqual({ angle: 0, zoom: 1 })
    })

    test('Should not be able to select a disabled camera', () => {
      const stateWithCameras = {
        ...defaultState,
        cameras: [{ id: 'id-1', name: 'camera-1', enabled: false }]
      }

      const selectedCamera = 'id-1'
      const updatedState = cameraReducer(stateWithCameras, { type: 'select-camera', data: { id: selectedCamera } })

      expect(updatedState.currentCamera).toBeUndefined()
    })
  })

  describe('rotate camera', () => {
    test.each([
      {
        currentAngle: 0,
        direction: 'cw',
        expected: 90
      },
      {
        currentAngle: 90,
        direction: 'cw',
        expected: 180
      },
      {
        currentAngle: 180,
        direction: 'cw',
        expected: 270
      },
      {
        currentAngle: 270,
        direction: 'cw',
        expected: 0
      },
      {
        currentAngle: 0,
        direction: 'ccw',
        expected: -90
      },
      {
        currentAngle: -90,
        direction: 'ccw',
        expected: -180
      },
      {
        currentAngle: -180,
        direction: 'ccw',
        expected: -270
      },
      {
        currentAngle: -270,
        direction: 'ccw',
        expected: -0
      }
    ])(
      'When rotating "$direction" from angle of $currentAngle it should be $expected',
      ({ currentAngle, direction, expected }) => {
        const stateWithSelectedCamera = {
          ...defaultState,
          cameras: [{ id: 'id-1', name: 'camera-1', enabled: true }],
          currentCamera: { id: 'id-1', name: 'camera-1', enabled: true },
          cameraSettings: {
            'id-1': {
              angle: currentAngle,
              zoom: 1
            }
          }
        }

        const updatedState = cameraReducer(stateWithSelectedCamera, {
          type: 'rotate-camera',
          data: { direction: direction as CameraRotationDirection }
        })

        expect(updatedState.cameraSettings['id-1'].angle).toBe(expected)
      }
    )
  })

  describe('zoom camera', () => {
    test.each([
      {
        currentZoom: 1,
        step: 1,
        expected: 2
      },
      {
        currentZoom: 2,
        step: 1,
        expected: 3
      },
      {
        currentZoom: 3,
        step: 1,
        expected: 4
      },
      {
        currentZoom: 4,
        step: 1,
        expected: 4
      },
      {
        currentZoom: 4,
        step: -1,
        expected: 3
      },
      {
        currentZoom: 3,
        step: -1,
        expected: 2
      },
      {
        currentZoom: 2,
        step: -1,
        expected: 1
      },
      {
        currentZoom: 1,
        step: -1,
        expected: 1
      }
    ])(
      'When zooming by step "$step" from zoom of $currentZoom it should be $expected',
      ({ currentZoom, step, expected }) => {
        const stateWithSelectedCamera = {
          ...defaultState,
          cameras: [{ id: 'id-1', name: 'camera-1', enabled: true }],
          currentCamera: { id: 'id-1', name: 'camera-1', enabled: true },
          cameraSettings: {
            'id-1': {
              angle: 0,
              zoom: currentZoom
            }
          }
        }

        const updatedState = cameraReducer(stateWithSelectedCamera, { type: 'zoom-camera', data: { step } })

        expect(updatedState.cameraSettings['id-1'].zoom).toBe(expected)
      }
    )

    test('When resetting zoom it should set the zoom to 1', () => {
      const stateWithSelectedCamera = {
        ...defaultState,
        cameras: [{ id: 'id-1', name: 'camera-1', enabled: true }],
        currentCamera: { id: 'id-1', name: 'camera-1', enabled: true },
        cameraSettings: {
          'id-1': {
            angle: 0,
            zoom: 4
          }
        }
      }

      const updatedState = cameraReducer(stateWithSelectedCamera, { type: 'reset-zoom-camera' })

      expect(updatedState.cameraSettings['id-1'].zoom).toEqual(1)
    })
  })

  describe('toggle camera', () => {
    test('Should not be able to toggle the current camera', () => {
      const currentState = {
        ...defaultState,
        cameras: [{ id: 'id-1', name: 'camera-1', enabled: true }],
        currentCamera: { id: 'id-1', name: 'camera-1', enabled: true }
      }

      const updatedState = cameraReducer(currentState, { type: 'toggle-camera', data: { id: 'id-1' } })

      expect(updatedState).toBe(currentState)
    })

    test('Toggle camera should set a disabled camera to enabled', () => {
      const currentState = {
        ...defaultState,
        cameras: [
          { id: 'id-1', name: 'camera-1', enabled: false },
          { id: 'id-2', name: 'camera-2', enabled: true }
        ],
        currentCamera: { id: 'id-2', name: 'camera-1', enabled: true }
      }

      const cameraToToggle = 'id-1'

      const updatedState = cameraReducer(currentState, { type: 'toggle-camera', data: { id: cameraToToggle } })

      const cameraThatShouldHaveBeenToggled = updatedState.cameras.find(cam => cam.id === cameraToToggle)

      expect(cameraThatShouldHaveBeenToggled?.enabled).toBe(true)
      expect(updatedState.disabledCameras).not.toEqual(expect.arrayContaining([cameraToToggle]))
    })

    test('Toggle camera should set a enabled camera to disabled', () => {
      const currentState = {
        ...defaultState,
        cameras: [
          { id: 'id-1', name: 'camera-1', enabled: true },
          { id: 'id-2', name: 'camera-2', enabled: true }
        ],
        currentCamera: { id: 'id-2', name: 'camera-1', enabled: true }
      }

      const cameraToToggle = 'id-1'

      const updatedState = cameraReducer(currentState, { type: 'toggle-camera', data: { id: cameraToToggle } })

      const cameraThatShouldHaveBeenToggled = updatedState.cameras.find(cam => cam.id === cameraToToggle)

      expect(cameraThatShouldHaveBeenToggled?.enabled).toBe(false)
      expect(updatedState.disabledCameras).toEqual(expect.arrayContaining([cameraToToggle]))
    })
  })
})
