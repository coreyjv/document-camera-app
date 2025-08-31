import './App.css'
import { CameraContainer } from './CameraContainer.tsx'
import { ControlsContainer } from './ControlsContainer.tsx'
import { CameraProvider } from './CameraProvider.tsx'
import { ThemeProvider } from '@/components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <CameraProvider>
        <CameraContainer />
        <ControlsContainer />
      </CameraProvider>
    </ThemeProvider>
  )
}

export default App
