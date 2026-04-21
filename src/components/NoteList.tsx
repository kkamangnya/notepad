import type { Note } from '../types'
import { NoteCard } from './NoteCard'

type Props = {
  notes: Note[]
  selectedId?: string
  onSelect: (id: string) => void
  nickname: string
}

export function NoteList({ notes, selectedId, onSelect, nickname }: Props) {
  return (
    <div className="noteList">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} selected={note.id === selectedId} onSelect={onSelect} nickname={nickname} />
      ))}
    </div>
  )
}
