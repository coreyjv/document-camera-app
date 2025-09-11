import { CameraContainer } from './CameraContainer.tsx'
import { ControlsContainer } from './ControlsContainer.tsx'
import { CameraProvider } from './CameraProvider.tsx'
import { ThemeProvider } from '@/components/theme-provider'
import * as Sentry from '@sentry/react'
import { Error } from '@/Error.tsx'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Sentry.ErrorBoundary fallback={Error}>
        <CameraProvider>
          <CameraContainer />
          <ControlsContainer />
        </CameraProvider>
      </Sentry.ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
