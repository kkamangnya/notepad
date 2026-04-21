import { useEffect, useMemo, useState } from 'react'
import type { CanvasTool, Note, NoteImage } from '../types'
import { CanvasEditor } from './CanvasEditor'
import { formatKstDate } from '../lib/date'

type Draft = Pick<Note, 'id' | 'title' | 'content' | 'canvasData' | 'images' | 'createdAt' | 'updatedAt'>

type Props = {
  note: Draft
  theme: 'light' | 'dark'
  onChange: (patch: Partial<Draft>) => void
  onSave: () => void
  onDelete: () => void
  onUploadImage: (file: File) => Promise<NoteImage>
}

export function Editor({ note, theme, onChange, onSave, onDelete, onUploadImage }: Props) {
  const [tool, setTool] = useState<CanvasTool>('draw')
  const [brushColor, setBrushColor] = useState('#2f2b26')
  const [brushSize, setBrushSize] = useState(4)

  const updatedLabel = useMemo(() => formatKstDate(note.updatedAt), [note.updatedAt])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="editorShell">
      <div className="editorHeader">
        <div>
          <p className="eyebrow">메모 편집</p>
          <h2>{note.title || '제목 없음'}</h2>
          <p className="timestamp">최종 수정: {updatedLabel}</p>
        </div>
        <div className="editorActions">
          <button className="primaryButton" type="button" onClick={onSave}>
            저장
          </button>
          <button className="dangerButton" type="button" onClick={onDelete}>
            삭제
          </button>
        </div>
      </div>

      <div className="editorGrid">
        <section className="textPanel">
          <label>
            <span>제목</span>
            <input value={note.title} onChange={(event) => onChange({ title: event.target.value })} placeholder="제목을 입력하세요" />
          </label>

          <label>
            <span>본문</span>
            <textarea
              value={note.content}
              onChange={(event) => onChange({ content: event.target.value })}
              placeholder="메모 내용을 작성하세요"
            />
          </label>

          <div className="metaBox">
            <span>createdAt</span>
            <strong>{formatKstDate(note.createdAt)}</strong>
            <span>updatedAt</span>
            <strong>{formatKstDate(note.updatedAt)}</strong>
          </div>
        </section>

        <section className="drawingPanel">
          <div className="toolbar">
            <button className={tool === 'draw' ? 'tool active' : 'tool'} type="button" onClick={() => setTool('draw')}>
              펜
            </button>
            <button className={tool === 'erase' ? 'tool active' : 'tool'} type="button" onClick={() => setTool('erase')}>
              지우개
            </button>
            <button className={tool === 'select' ? 'tool active' : 'tool'} type="button" onClick={() => setTool('select')}>
              선택
            </button>

            <label className="control">
              색상
              <input type="color" value={brushColor} onChange={(event) => setBrushColor(event.target.value)} />
            </label>

            <label className="control">
              두께
              <input
                type="range"
                min="1"
                max="32"
                value={brushSize}
                onChange={(event) => setBrushSize(Number(event.target.value))}
              />
            </label>
          </div>

          <CanvasEditor
            noteId={note.id}
            tool={tool}
            brushColor={brushColor}
            brushSize={brushSize}
            canvasData={note.canvasData}
            images={note.images}
            onChange={(payload) => onChange(payload)}
            onUploadImage={onUploadImage}
            theme={theme}
          />
        </section>
      </div>
    </div>
  )
}
