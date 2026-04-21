import type { Note } from '../types'
import { formatKstDate } from '../lib/date'

type Props = {
  note: Note
  selected: boolean
  onSelect: (id: string) => void
}

export function NoteCard({ note, selected, onSelect }: Props) {
  const preview = note.content.trim() || '내용 없음'

  return (
    <button className={`noteCard ${selected ? 'selected' : ''}`} type="button" onClick={() => onSelect(note.id)}>
      <div className="noteCardHeader">
        <h3>{note.title || '제목 없음'}</h3>
        <time dateTime={note.updatedAt}>{formatKstDate(note.updatedAt)}</time>
      </div>
      <p>{preview}</p>
    </button>
  )
}
