import './ControlsContainer.css'
import {useCamera} from "./CameraProvider.tsx";

export function ControlsContainer() {
    const {cameras, rotate, currentCamera, selectCamera, zoom, resetZoom, cameraSettings } = useCamera();

    return (<div id={'controls-container'}>
        <select id='camera-select' defaultValue={'select-a-camera'} value={currentCamera?.id} onChange={(e) => selectCamera({ id: e.target.value })}>
            <option disabled value={'select-a-camera'}>Select a camera...</option>
            {cameras?.map(cam => <option key={cam.id} value={cam.id}>{cam.name}</option>)}
        </select>
        <button disabled={currentCamera === undefined} onClick={() => rotate({ direction: 'cw' })}>Rotate CW</button>
        <button disabled={currentCamera === undefined} onClick={() => rotate({ direction: 'ccw' })}>Rotate CCW</button>
        <button disabled={currentCamera === undefined} onClick={() => zoom({ step: -1 })}>Zoom Out</button>
        <button disabled={currentCamera === undefined} onClick={() => resetZoom()}>{currentCamera ? `${cameraSettings[currentCamera.id].zoom}x` : ''}</button>
        <button disabled={currentCamera === undefined} onClick={() => zoom({ step: 1 })}>Zoom In</button>
    </div>)
}