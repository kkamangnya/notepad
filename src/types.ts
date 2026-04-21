export type ThemeMode = 'light' | 'dark'

export type CanvasTool = 'draw' | 'erase' | 'select'

export interface NoteImage {
  id: string
  url: string
  x: number
  y: number
  scale: number
  rotation: number
  width?: number
  height?: number
  name?: string
}

export interface Note {
  id: string
  userId: string
  title: string
  content: string
  canvasData: string
  images: NoteImage[]
  createdAt: string
  updatedAt: string
}

export interface SaveNoteInput {
  id?: string
  title: string
  content: string
  canvasData: string
  images: NoteImage[]
  createdAt?: string
}
