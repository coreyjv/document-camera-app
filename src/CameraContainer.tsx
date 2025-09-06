import { useEffect, useRef } from 'react'
import { useCamera } from './CameraProvider.tsx'

export function CameraContainer() {
  const { currentCamera, cameraSettings } = useCamera()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let isCurrent = true

    async function fetchStream() {
      if (currentCamera) {
        const str = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: currentCamera.id } }
        })

        if (isCurrent && videoRef.current) {
          videoRef.current.srcObject = str
        }

        return {
          cleanup: () => {
            str.getTracks().forEach(track => {
              track.stop()
            })
          }
        }
      }
    }

    const promise = fetchStream()

    return () => {
      isCurrent = false
      void promise.then(x => x?.cleanup())
    }
  }, [currentCamera, videoRef])
  return (
    <div className="max-w-full flex justify-center items-center h-screen bg-background">
      {currentCamera?.id && (
        <video
          ref={videoRef}
          disablePictureInPicture
          style={{
            objectFit: 'contain',
            height: '100vh',
            transform: `rotate(${String(cameraSettings[currentCamera.id].angle)}deg) scale(${String(cameraSettings[currentCamera.id].zoom)})`
          }}
          autoPlay
        />
      )}
    </div>
  )
}
