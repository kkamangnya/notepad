import type { Note } from '../types'
import { NoteCard } from './NoteCard'

type Props = {
  notes: Note[]
  selectedId?: string
  onSelect: (id: string) => void
}

export function NoteList({ notes, selectedId, onSelect }: Props) {
  return (
    <div className="noteList">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} selected={note.id === selectedId} onSelect={onSelect} />
      ))}
    </div>
  )
}
