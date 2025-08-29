import { useEffect, useState, useRef } from 'react'
import './CameraContainer.css'
import {useCamera} from "./CameraProvider.tsx";

export function CameraContainer() {
    const { currentCamera, cameraSettings } = useCamera()
    const videoRef = useRef(null)
    // const [stream, setStream] = useState(null)

    useEffect(() => {
        let isCurrent = true

        async function fetchStream() {
            if (currentCamera) {
                const str = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: currentCamera.id } }
                });

                if (isCurrent) {
                    videoRef.current.srcObject = str
                }

                return { cleanup: () => str.getTracks().forEach(track => track.stop()) }
            }
        }

        const promise = fetchStream()

        return () => {
            isCurrent = false
            void promise.then(x => x?.cleanup())
        }
    }, [currentCamera?.id, videoRef]);
    return (<div id={'camera-container'}>
        {currentCamera?.id && <video ref={videoRef} style={{objectFit: 'contain', height: '100vh', transform: `rotate(${cameraSettings[currentCamera.id].angle}deg) scale(${cameraSettings[currentCamera.id].zoom})`}} autoPlay />}
    </div>)
}