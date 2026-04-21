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
      url: String(item.getSrc?.() ?? item.src ?? item.get?.('src') ?? ''),
      x: item.left ?? 0,
      y: item.top ?? 0,
      scale: item.scaleX ?? 1,
      rotation: item.angle ?? 0,
      width: item.width ?? 0,
      height: item.height ?? 0,
      name: String(item.name ?? ''),
    }))
}

function syncImages(canvas: any, images: NoteImage[]) {
  const existingIds = new Set(
    (canvas.getObjects() as any[])
      .filter((item) => item.type === 'image')
      .map((item) => String(item.data?.imageId ?? item.name ?? '')),
  )

  images.forEach((image) => {
    if (existingIds.has(image.id)) return
    void loadFabricImage(image.url).then((fabricImage: any) => {
      placeImageOnCanvas(canvas, fabricImage, image, false)
      canvas.add(fabricImage)
      fabricImage.setCoords()
      canvas.requestRenderAll()
    })
  })
}

async function loadFabricImage(url: string) {
  try {
    const viaFabric = await new Promise<any>((resolve, reject) => {
      let settled = false
      const timer = window.setTimeout(() => {
        if (!settled) reject(new Error('이미지 로딩 시간이 초과되었습니다.'))
      }, 8000)

      fabric.Image.fromURL(
        url,
        (fabricImage: any) => {
          settled = true
          window.clearTimeout(timer)
          resolve(fabricImage)
        },
        { crossOrigin: 'anonymous' },
      )
    })

    if (viaFabric) return viaFabric
  } catch {
    // Fall through to the manual loader below.
  }

  return await new Promise<any>((resolve, reject) => {
    const element = new Image()
    element.crossOrigin = 'anonymous'
    element.onload = () => resolve(new fabric.Image(element))
    element.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'))
    element.src = url
  })
}

function placeImageOnCanvas(canvas: any, fabricImage: any, image: NoteImage, center = true) {
  const canvasWidth = canvas.getWidth()
  const canvasHeight = canvas.getHeight()
  const naturalWidth = fabricImage.width || 1
  const naturalHeight = fabricImage.height || 1
  const maxWidth = canvasWidth * 0.72
  const maxHeight = canvasHeight * 0.72
  const fitScale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1)
  const scale = image.scale && image.scale > 0 ? image.scale : fitScale

  fabricImage.set({
    left: center ? (canvasWidth - naturalWidth * scale) / 2 : image.x,
    top: center ? (canvasHeight - naturalHeight * scale) / 2 : image.y,
    scaleX: scale,
    scaleY: scale,
    angle: image.rotation,
    hasControls: true,
    hasBorders: true,
    selectable: true,
    evented: true,
    name: image.name,
    data: { imageId: image.id },
  } as any)
}

export function CanvasEditor({ noteId, tool, brushColor, brushSize, canvasData, images, onChange, onUploadImage, theme }: Props) {
  const canvasEl = useRef<HTMLCanvasElement | null>(null)
  const canvasRef = useRef<any>(null)
  const toolRef = useRef<CanvasTool>(tool)
  const initializedNoteIdRef = useRef<string>('')
  const loadingRef = useRef(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    toolRef.current = tool
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.isDrawingMode = tool === 'draw' || tool === 'erase'
    const brush = canvas.freeDrawingBrush as any
    if (brush) {
      brush.width = brushSize
      brush.color = tool === 'erase' ? '#ffffff' : brushColor
    }
  }, [tool, brushColor, brushSize])

  useEffect(() => {
    const canvas = canvasEl.current
    if (!canvas || canvasRef.current) return

    const fabricCanvas = new fabric.Canvas(canvas, {
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: theme === 'dark' ? '#1c1b22' : '#fffaf1',
    })

    fabricCanvas.setWidth(canvas.parentElement?.clientWidth ?? 600)
    fabricCanvas.setHeight(420)
    fabricCanvas.isDrawingMode = tool === 'draw' || tool === 'erase'
    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas)
    fabricCanvas.freeDrawingBrush.color = tool === 'erase' ? '#ffffff' : brushColor
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

    fabricCanvas.on('object:added', () => {
      if (!loadingRef.current) emitChange(fabricCanvas)
    })
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
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setBackgroundColor(theme === 'dark' ? '#1c1b22' : '#fffaf1', () => canvas.renderAll())
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (initializedNoteIdRef.current === noteId) return

    loadingRef.current = true
    canvas.clear()
    canvas.setBackgroundColor(theme === 'dark' ? '#1c1b22' : '#fffaf1', () => canvas.renderAll())

    if (canvasData?.trim()) {
      try {
        const parsed = JSON.parse(canvasData)
        canvas.loadFromJSON(parsed, () => {
          canvas.renderAll()
          syncImages(canvas, images)
          loadingRef.current = false
        })
      } catch {
        loadingRef.current = false
      }
    } else {
      syncImages(canvas, images)
      loadingRef.current = false
    }

    initializedNoteIdRef.current = noteId
  }, [noteId, canvasData, images, theme])

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
    const fabricImage = await loadFabricImage(image.url)
    placeImageOnCanvas(canvas, fabricImage, image, true)
    canvas.add(fabricImage)
    canvas.setActiveObject(fabricImage)
    fabricImage.setCoords()
    canvas.requestRenderAll()
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
