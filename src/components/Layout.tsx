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
  nickname: string
  authLabel: string
  onNicknameChange: (value: string) => void
  children: ReactNode
}

function getInitials(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return 'NA'
  return trimmed.slice(0, 2).toUpperCase()
}

export function Layout({
  notes,
  selectedId,
  query,
  theme,
  onQueryChange,
  onSelect,
  onToggleTheme,
  onNewNote,
  nickname,
  authLabel,
  onNicknameChange,
  children,
}: Props) {
  return (
    <div className="appFrame">
      <aside className="sidebar">
        <div className="sidebarHeader">
          <div className="brandBlock">
            <p className="eyebrow">React 메모</p>
            <h1>Noteapad</h1>
            <div className="authChip">
              <span className="avatar" aria-hidden="true">
                {getInitials(nickname)}
              </span>
              <div>
                <strong>{nickname.trim() || '익명 사용자'}</strong>
                <p>{authLabel}</p>
              </div>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="profileCard">
          <label className="profileField">
            <span>닉네임</span>
            <input value={nickname} onChange={(event) => onNicknameChange(event.target.value)} placeholder="표시할 이름" />
          </label>
          <p className="profileHint">실제 저장 권한은 Firebase 익명 로그인 uid로 관리됩니다.</p>
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

        <NoteList notes={notes} selectedId={selectedId} onSelect={onSelect} nickname={nickname} />
      </aside>

      <main className="mainArea">{children}</main>
    </div>
  )
}
