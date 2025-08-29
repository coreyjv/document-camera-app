import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CameraProvider } from './CameraProvider'
import { act } from 'react'
import type { Mock } from 'vitest'

describe('CameraProvider', () => {
  test('If no cameras are connected display a message', async () => {
    ;(navigator.mediaDevices.getUserMedia as Mock).mockResolvedValueOnce({})
    ;(navigator.mediaDevices.enumerateDevices as Mock).mockResolvedValueOnce([])

    await act(() =>
      render(
        <CameraProvider>
          <p>A child</p>
        </CameraProvider>
      )
    )

    const message = screen.getByText('Please connect a camera')
    const child = screen.queryByText('A child')

    expect(message).toBeInTheDocument()
    expect(child).not.toBeInTheDocument()
  })

  test('If cameras are connected display the child', async () => {
    ;(navigator.mediaDevices.getUserMedia as Mock).mockResolvedValueOnce({})
    ;(navigator.mediaDevices.enumerateDevices as Mock).mockResolvedValueOnce([
      { deviceId: 'id-1', label: 'camera-1', kind: 'videoinput' }
    ])

    await act(() =>
      render(
        <CameraProvider>
          <p>A child</p>
        </CameraProvider>
      )
    )

    const message = screen.queryByText('Please connect a camera')
    const child = screen.getByText('A child')

    expect(child).toBeInTheDocument()
    expect(message).not.toBeInTheDocument()
  })

  test.todo('When user does not grant permission they should be able to request permission again')
  test.todo('When a new device is connected it is available in the list of cameras')
})
