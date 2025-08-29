import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

import '@testing-library/jest-dom/vitest'

// TODO Research if there's a better way to mock navigator.mediaDevices
// @ts-expect-error Disabling as I am setting up mocks
;(navigator as unknown).mediaDevices = {}
navigator.mediaDevices.getUserMedia = vi.fn()
navigator.mediaDevices.enumerateDevices = vi.fn()
navigator.mediaDevices.addEventListener = vi.fn()
navigator.mediaDevices.removeEventListener = vi.fn()

afterEach(() => {
  cleanup()
})
