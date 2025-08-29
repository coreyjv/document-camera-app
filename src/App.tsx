import './App.css'
import {CameraContainer} from "./CameraContainer.tsx";
import {ControlsContainer} from "./ControlsContainer.tsx";
import {CameraProvider} from "./CameraProvider.tsx";

function App() {
    return (
        <CameraProvider>
            <CameraContainer />
            <ControlsContainer />
        </CameraProvider>
    )
}

export default App
