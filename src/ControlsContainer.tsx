import { useCamera } from './CameraProvider.tsx'
import { AutoHide } from './AutoHide.tsx'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw, RotateCw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ControlsContainer() {
  const { cameras, rotate, currentCamera, selectCamera, zoom, resetZoom, cameraSettings } = useCamera()

  return (
    <AutoHide disabled={cameras.length === 0}>
      <div className="absolute ml-auto mr-auto mb-4 left-1/2 transform-[translateX(-50%)] bottom-0 flex flex-wrap items-center gap-2 p-4 rounded-lg bg-muted">
        <Select
          onValueChange={value => {
            selectCamera({ id: value })
          }}
          value={currentCamera?.id}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a camera..." />
          </SelectTrigger>
          <SelectContent>
            {cameras.map(cam => (
              <SelectItem key={cam.id} value={cam.id}>
                {cam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
