import { useState, useEffect, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'

interface AutoHideProps {
  timeoutMs?: number
  disabled?: boolean
  children: ReactNode
}

const AutoHide = ({ timeoutMs = 3000, disabled = false, children }: AutoHideProps) => {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<number | undefined>(undefined)

  const resetTimer = useCallback(() => {
    if (disabled) {
      return
    }

    setVisible(prev => {
      if (!prev) {
        return true
      }

      return prev
    })

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      setVisible(false)
    }, timeoutMs)
  }, [disabled, timeoutMs])

  useEffect(() => {
    if (disabled) {
      setVisible(true)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = undefined
      }
      return
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart']

    for (const event of events) {
      window.addEventListener(event, resetTimer)
    }

    resetTimer()

    return () => {
      for (const event of events) {
        window.removeEventListener(event, resetTimer)
      }

      window.clearTimeout(timerRef.current)
    }
  }, [disabled, resetTimer])

  return visible ? <>{children}</> : null
}

export { AutoHide }
