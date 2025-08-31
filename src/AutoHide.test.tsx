import { describe, test, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AutoHide } from './AutoHide'

describe('AutoHide Component (real timers)', () => {
  const timeoutMs = 500

  test('renders children initially', () => {
    render(
      <AutoHide timeoutMs={timeoutMs}>
        <div>Visible Content</div>
      </AutoHide>
    )
    expect(screen.getByText('Visible Content')).toBeInTheDocument()
  })

  test('hides children after timeout of inactivity', async () => {
    render(
      <AutoHide timeoutMs={timeoutMs}>
        <div>Visible Content</div>
      </AutoHide>
    )

    await waitFor(
      () => {
        expect(screen.queryByText('Visible Content')).not.toBeInTheDocument()
      },
      { timeout: timeoutMs + 300 }
    )
  })

  test('resets timer on mouse move', async () => {
    render(
      <AutoHide timeoutMs={timeoutMs}>
        <div>Visible Content</div>
      </AutoHide>
    )

    // Wait just under the timeout
    await new Promise(r => setTimeout(r, timeoutMs - 100))

    // Trigger mouse activity to reset the timer
    window.dispatchEvent(new MouseEvent('mousemove'))

    // Wait again: should be less than full timeout to confirm it's still visible
    await new Promise(r => setTimeout(r, timeoutMs - 50))

    // ✅ Still visible because timer was reset
    expect(screen.getByText('Visible Content')).toBeInTheDocument()

    // Now wait long enough for it to disappear
    await waitFor(
      () => {
        expect(screen.queryByText('Visible Content')).not.toBeInTheDocument()
      },
      { timeout: timeoutMs + 300 }
    )
  })

  test('resets timer on key press', async () => {
    render(
      <AutoHide timeoutMs={timeoutMs}>
        <div>Visible Content</div>
      </AutoHide>
    )

    await new Promise(res => setTimeout(res, timeoutMs / 2))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))

    await new Promise(res => setTimeout(res, timeoutMs / 2 + 100))
    expect(screen.getByText('Visible Content')).toBeInTheDocument()

    await waitFor(
      () => {
        expect(screen.queryByText('Visible Content')).not.toBeInTheDocument()
      },
      { timeout: timeoutMs + 300 }
    )
  })

  test('shows children again after activity when hidden', async () => {
    render(
      <AutoHide timeoutMs={timeoutMs}>
        <div>Visible Content</div>
      </AutoHide>
    )

    await waitFor(
      () => {
        expect(screen.queryByText('Visible Content')).not.toBeInTheDocument()
      },
      { timeout: timeoutMs + 300 }
    )

    window.dispatchEvent(new MouseEvent('mousemove'))

    await waitFor(
      () => {
        expect(screen.getByText('Visible Content')).toBeInTheDocument()
      },
      { timeout: 300 }
    )
  })

  test('disables autohide when disabled is true', async () => {
    render(
      <AutoHide timeoutMs={timeoutMs} disabled={true}>
        <div>Visible Content</div>
      </AutoHide>
    )

    await new Promise(res => setTimeout(res, timeoutMs * 2))
    expect(screen.getByText('Visible Content')).toBeInTheDocument()
  })

  test('reenables autohide if disabled changes from true to false', async () => {
    const { rerender } = render(
      <AutoHide timeoutMs={timeoutMs} disabled={true}>
        <div>Visible Content</div>
      </AutoHide>
    )

    expect(screen.getByText('Visible Content')).toBeInTheDocument()

    rerender(
      <AutoHide timeoutMs={timeoutMs} disabled={false}>
        <div>Visible Content</div>
      </AutoHide>
    )

    await waitFor(
      () => {
        expect(screen.queryByText('Visible Content')).not.toBeInTheDocument()
      },
      { timeout: timeoutMs + 300 }
    )
  })
})
