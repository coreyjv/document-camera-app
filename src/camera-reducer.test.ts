import { expect, describe, test } from 'vitest'
import { cameraReducer, type CameraRotationDirection } from './camera-reducer.ts'

describe('camera-reducer', () => {
  const defaultState = {
    cameras: [],
    isInitializingCameraList: false,
    currentCamera: undefined,
    cameraSettings: {}
  }

  test('When initializing camera list isInitializingCameraList should be true', () => {
    const updatedState = cameraReducer(defaultState, { type: 'initializing-camera-list' })

    expect(updatedState.isInitializingCameraList).toBe(true)
  })

  test('When updating camera list isInitializingCameraList should be false and state should reflect new cameras', () => {
    const currentState = {
      ...defaultState,
      cameras: [
        { id: 'id-1', name: 'camera-1' },
        { id: 'id-2', name: 'camera-2' }
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
        { id: newCameras[0].deviceId, name: newCameras[0].label },
        { id: newCameras[1].deviceId, name: newCameras[1].label }
      ])
    )
  })

  test('When the camera list updates and the current camera is no longer connected set current camera to undefined', () => {
    const currentState = {
      ...defaultState,
      cameras: [
        { id: 'id-1', name: 'camera-1' },
        { id: 'id-2', name: 'camera-2' }
      ],
      currentCamera: { id: 'id-1', name: 'camera-1' },
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
        { id: newCameras[0].deviceId, name: newCameras[0].label },
        { id: newCameras[1].deviceId, name: newCameras[1].label }
      ])
    )
  })

  test('When the initial camera list is fetched if the last camera that was used exists make it the current camera', () => {
    const currentState = {
      ...defaultState,
      cameras: [],
      isInitializingCameraList: true
    }

    const newCameras = [
      { deviceId: 'id-1', label: 'camera-1' },
      { deviceId: 'id-2', label: 'camera-2' }
    ]

    const lastUsedCamera = 'id-2'

    const updatedState = cameraReducer(currentState, {
      type: 'initial-camera-list',
      data: { cameras: newCameras, lastUsedCamera }
    })

    expect(updatedState.isInitializingCameraList).toBe(false)
    expect(updatedState.currentCamera?.id).toEqual(lastUsedCamera)
    expect(updatedState.cameraSettings[lastUsedCamera]).toEqual({ angle: 0, zoom: 1 })
    expect(updatedState.cameras).toEqual(
      expect.arrayContaining([
        { id: newCameras[0].deviceId, name: newCameras[0].label },
        { id: newCameras[1].deviceId, name: newCameras[1].label }
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
        { id: newCameras[0].deviceId, name: newCameras[0].label },
        { id: newCameras[1].deviceId, name: newCameras[1].label }
      ])
    )
  })

  test('When selecting a camera and it does not exist in the list do not change state', () => {
    const updatedState = cameraReducer(defaultState, { type: 'select-camera', data: { id: 'does-not-exist' } })

    expect(updatedState).toStrictEqual(defaultState)
  })

  test('When selecting a camera and it exists set it as the current camera', () => {
    const stateWithCameras = {
      ...defaultState,
      cameras: [
        { id: 'id-1', name: 'camera-1' },
        { id: 'id-2', name: 'camera-2' }
      ]
    }

    const updatedState = cameraReducer(stateWithCameras, { type: 'select-camera', data: { id: 'id-1' } })

    expect(updatedState.currentCamera).toStrictEqual(stateWithCameras.cameras[0])
  })

  test('When selecting a camera and it exists default its settings', () => {
    const stateWithCameras = {
      ...defaultState,
      cameras: [
        { id: 'id-1', name: 'camera-1' },
        { id: 'id-2', name: 'camera-2' }
      ]
    }

    const selectedCamera = 'id-1'
    const updatedState = cameraReducer(stateWithCameras, { type: 'select-camera', data: { id: selectedCamera } })

    expect(updatedState.cameraSettings[selectedCamera]).toEqual({ angle: 0, zoom: 1 })
  })

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
        cameras: [{ id: 'id-1', name: 'camera-1' }],
        currentCamera: { id: 'id-1', name: 'camera-1' },
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
        cameras: [{ id: 'id-1', name: 'camera-1' }],
        currentCamera: { id: 'id-1', name: 'camera-1' },
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
      cameras: [{ id: 'id-1', name: 'camera-1' }],
      currentCamera: { id: 'id-1', name: 'camera-1' },
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
