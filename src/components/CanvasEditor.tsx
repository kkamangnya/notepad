import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { fabric } from 'fabric'
import type { CanvasTool, NoteImage } from '../types'

type Props = {
  noteId: string
  tool: CanvasTool
  brushColor: string
  brushSize: number
  canvasData: string
  images: NoteImage[]
  onChange: (payload: { canvasData: string; images: NoteImage[] }) => void
  onUploadImage: (file: File) => Promise<NoteImage>
  theme: 'light' | 'dark'
}

function extractImages(canvas: any): NoteImage[] {
  return (canvas.getObjects() as any[])
    .filter((item) => item.type === 'image')
    .map((item) => ({
      id: String(item.data?.imageId ?? item.name ?? crypto.randomUUID()),
      url: String((item.getSrc?.() ?? item.src ?? item.get?.('src')) || ''),
      x: item.left ?? 0,
      y: item.top ?? 0,
      scale: item.scaleX ?? 1,
      rotation: item.angle ?? 0,
      width: item.width ?? 0,
      height: item.height ?? 0,
      name: String(item.name ?? ''),
    }))
}

export function CanvasEditor({ noteId, tool, brushColor, brushSize, canvasData, images, onChange, onUploadImage, theme }: Props) {
  const canvasEl = useRef<HTMLCanvasElement | null>(null)
  const canvasRef = useRef<any>(null)
  const toolRef = useRef<CanvasTool>(tool)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    toolRef.current = tool
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = tool !== 'select'
    if (tool === 'draw' || tool === 'erase') {
      const brush = canvas.freeDrawingBrush as any
      brush.width = brushSize
      brush.color = tool === 'erase' ? '#ffffff' : brushColor
    }
  }, [tool, brushColor, brushSize])

  useEffect(() => {
    const canvas = canvasEl.current
    if (!canvas) return

    const fabricCanvas = new fabric.Canvas(canvas, {
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: theme === 'dark' ? '#1c1b22' : '#fffaf1',
    })

    fabricCanvas.setWidth(canvas.parentElement?.clientWidth ?? 600)
    fabricCanvas.setHeight(420)
    fabricCanvas.isDrawingMode = tool !== 'select'

    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas)
    fabricCanvas.freeDrawingBrush.color = brushColor
    fabricCanvas.freeDrawingBrush.width = brushSize

    fabricCanvas.on('path:created', (event: any) => {
      const path = event.path
      if (toolRef.current === 'erase' && path) {
        path.set({
          globalCompositeOperation: 'destination-out',
        } as any)
      }
      emitChange(fabricCanvas)
    })

    fabricCanvas.on('object:added', () => emitChange(fabricCanvas))
    fabricCanvas.on('object:modified', () => emitChange(fabricCanvas))
    fabricCanvas.on('object:removed', () => emitChange(fabricCanvas))

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Backspace' || event.key === 'Delete') && toolRef.current === 'select') {
        const active = fabricCanvas.getActiveObject()
        if (active) {
          fabricCanvas.remove(active)
          fabricCanvas.discardActiveObject()
          fabricCanvas.renderAll()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    canvasRef.current = fabricCanvas
    setIsReady(true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      fabricCanvas.dispose()
      canvasRef.current = null
    }
  }, [brushColor, brushSize, theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const background = theme === 'dark' ? '#1c1b22' : '#fffaf1'
    canvas.setBackgroundColor(background, () => canvas.renderAll())
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const payload = canvasData?.trim()
    canvas.clear()
    canvas.setBackgroundColor(theme === 'dark' ? '#1c1b22' : '#fffaf1', () => canvas.renderAll())

    if (!payload) {
      return
    }

    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload
    canvas.loadFromJSON(parsed, () => {
      canvas.renderAll()
    })
  }, [noteId, canvasData, theme])

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const image = await onUploadImage(file)
    const canvas = canvasRef.current
    if (!canvas) return
    await addImageToCanvas(canvas, image)
    emitChange(canvas)
    event.target.value = ''
  }

  async function addImageToCanvas(canvas: any, image: NoteImage) {
    await new Promise<void>((resolve) => {
      fabric.Image.fromURL(image.url, (fabricImage: any) => {
        fabricImage.set({
          left: image.x,
          top: image.y,
          scaleX: image.scale,
          scaleY: image.scale,
          angle: image.rotation,
          hasControls: true,
          hasBorders: true,
          name: image.name,
          data: { imageId: image.id },
        } as any)
        canvas.add(fabricImage)
        canvas.setActiveObject(fabricImage)
        canvas.renderAll()
        resolve()
      })
    })
  }

  function emitChange(canvas: any) {
    const canvasDataPayload = JSON.stringify(canvas.toJSON(['data', 'name', 'globalCompositeOperation']))
    onChange({
      canvasData: canvasDataPayload,
      images: extractImages(canvas),
    })
  }

  return (
    <section className="canvasPanel">
      <div className="canvasToolbar">
        <label className="fileButton">
          이미지 추가
          <input type="file" accept="image/*" onChange={handleUpload} hidden />
        </label>
        <div className="canvasStatus">{isReady ? '캔버스 준비됨' : '캔버스 로딩 중'}</div>
      </div>
      <div className="canvasSurface">
        <canvas ref={canvasEl} />
      </div>
    </section>
  )
}
