import { useCamera } from './CameraProvider.tsx'
import { AutoHide } from './AutoHide.tsx'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Eye, EyeOff } from 'lucide-react'
import { PopoverContent, Popover, PopoverTrigger } from '@/components/ui/popover.tsx'
import { Fragment } from 'react'

export function ControlsContainer() {
  const { cameras, rotate, currentCamera, selectCamera, toggleCamera, zoom, resetZoom, cameraSettings } = useCamera()

  return (
    <AutoHide disabled={cameras.length === 0}>
      <div className="absolute ml-auto mr-auto mb-4 left-1/2 transform-[translateX(-50%)] bottom-0 flex flex-wrap items-center gap-2 p-4 rounded-lg bg-muted">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">{currentCamera?.name ?? 'Select a camera...'}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4">
            <div className="grid grid-cols-[max-content_max-content_max-content] gap-4 items-center">
              {cameras.map(cam => (
                <Fragment key={cam.id}>
                  <Button
                    disabled={!cam.enabled}
                    variant={currentCamera?.id === cam.id ? 'ghost' : 'outline'}
                    className="col-start-1"
                    onClick={() => {
                      selectCamera({ id: cam.id })
                    }}
                  >
                    {cam.name}
                  </Button>
                  {/*{currentCamera?.id === cam.id && <Check />}*/}
                  <Button
                    disabled={currentCamera?.id === cam.id}
                    size="icon"
                    variant="outline"
                    className="col-start-2"
                    onClick={() => {
                      toggleCamera({ id: cam.id })
                    }}
                  >
                    {cam.enabled ? <Eye /> : <EyeOff />}
                  </Button>
                </Fragment>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button
          disabled={!currentCamera}
          onClick={() => {
            rotate({ direction: 'cw' })
          }}
          size="icon"
          variant="outline"
        >
          <RotateCw />
        </Button>
        <Button
          disabled={!currentCamera}
          onClick={() => {
            rotate({ direction: 'ccw' })
          }}
          size="icon"
          variant="outline"
        >
          <RotateCcw />
        </Button>
        <Button
          disabled={!currentCamera}
          onClick={() => {
            zoom({ step: -1 })
          }}
          size="icon"
          variant="outline"
        >
          <ZoomOut />
        </Button>
        <Button disabled={!currentCamera} onClick={resetZoom} variant="ghost">
          {currentCamera ? `${String(cameraSettings[currentCamera.id].zoom)}x` : ''}
        </Button>
        <Button
          disabled={!currentCamera}
          onClick={() => {
            zoom({ step: 1 })
          }}
          size="icon"
          variant="outline"
        >
          <ZoomIn />
        </Button>
      </div>
    </AutoHide>
  )
}
