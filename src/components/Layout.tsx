import type { ReactNode } from 'react'
import type { Note } from '../types'
import { NoteList } from './NoteList'
import { SearchBar } from './SearchBar'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  notes: Note[]
  selectedId?: string
  query: string
  theme: 'light' | 'dark'
  onQueryChange: (value: string) => void
  onSelect: (id: string) => void
  onToggleTheme: () => void
  onNewNote: () => void
  children: ReactNode
}

export function Layout({ notes, selectedId, query, theme, onQueryChange, onSelect, onToggleTheme, onNewNote, children }: Props) {
  return (
    <div className="appFrame">
      <aside className="sidebar">
        <div className="sidebarHeader">
          <div>
            <p className="eyebrow">React 메모</p>
            <h1>Noteapad</h1>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="sidebarActions">
          <button className="primaryButton" type="button" onClick={onNewNote}>
            새 메모
          </button>
          <SearchBar value={query} onChange={onQueryChange} />
        </div>

        <div className="sidebarMeta">
          <strong>{notes.length}개 메모</strong>
          <span>최신 수정 순으로 정렬</span>
        </div>

        <NoteList notes={notes} selectedId={selectedId} onSelect={onSelect} />
      </aside>

      <main className="mainArea">{children}</main>
    </div>
  )
}
