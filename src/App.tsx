import { useEffect, useMemo, useRef, useState } from 'react'
import { Layout } from './components/Layout'
import { Editor } from './components/Editor'
import type { Note, NoteImage } from './types'
import { noteRepository } from './lib/firebase'
import { nowIso } from './lib/date'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useLocalStorageTheme } from './hooks/useLocalStorageTheme'

function createBlankNote(userId: string): Note {
  const now = nowIso()
  return {
    id: crypto.randomUUID(),
    userId,
    title: '새 메모',
    content: '',
    canvasData: '',
    images: [],
    createdAt: now,
    updatedAt: now,
  }
}

export default function App() {
  const { theme, setTheme } = useLocalStorageTheme()
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [draft, setDraft] = useState<Note>(() => createBlankNote(''))
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [currentUserId, setCurrentUserId] = useState('')
  const lastPersistedSignature = useRef<string>('')

  const debouncedDraft = useDebouncedValue(draft, 500)
  const filteredNotes = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const sorted = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    if (!needle) return sorted
    return sorted.filter((note) => `${note.title}\n${note.content}`.toLowerCase().includes(needle))
  }, [notes, query])

  useEffect(() => {
    void loadNotes()
  }, [])

  useEffect(() => {
    if (selectedId) {
      const next = notes.find((note) => note.id === selectedId)
      if (next) setDraft(next)
    } else if (notes[0]) {
      setSelectedId(notes[0].id)
      setDraft(notes[0])
    }
  }, [notes, selectedId])

  useEffect(() => {
    const shouldPersist = selectedId && debouncedDraft.id === selectedId
    if (!shouldPersist) return

    const signature = buildSignature(debouncedDraft)
    if (signature === lastPersistedSignature.current) return

    const timer = window.setTimeout(() => {
      void persistDraft(debouncedDraft)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [debouncedDraft, selectedId])

  async function loadNotes() {
    setStatus('loading')
    try {
      const userId = await noteRepository.ensureFirebaseAuth()
      setCurrentUserId(userId)
      const result = await noteRepository.listNotes(userId)
      setNotes(result)
      if (result[0]) {
        setSelectedId(result[0].id)
        setDraft(result[0])
        lastPersistedSignature.current = buildSignature(result[0])
      } else {
        const blank = createBlankNote(userId)
        setSelectedId(blank.id)
        setDraft(blank)
        setNotes([blank])
        lastPersistedSignature.current = buildSignature(blank)
      }
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '메모를 불러오지 못했습니다.')
    }
  }

  function handleSelect(id: string) {
    const note = notes.find((item) => item.id === id)
    if (!note) return
    setSelectedId(id)
    setDraft(note)
    lastPersistedSignature.current = buildSignature(note)
  }

  function handleNewNote() {
    const next = createBlankNote(currentUserId)
    setNotes((current) => [next, ...current])
    setSelectedId(next.id)
    setDraft(next)
    lastPersistedSignature.current = buildSignature(next)
  }

  function handleDraftChange(patch: Partial<Note>) {
    setDraft((current) => ({ ...current, ...patch, updatedAt: nowIso() }))
  }

  async function persistDraft(current: Note) {
    setStatus('saving')
    try {
      const saved = await noteRepository.saveNote(
        {
          id: current.id,
          title: current.title,
          content: current.content,
          canvasData: current.canvasData,
          images: current.images,
          createdAt: current.createdAt,
        },
        currentUserId,
      )
      lastPersistedSignature.current = buildSignature(saved)
      setNotes((items) => [saved, ...items.filter((item) => item.id !== saved.id)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
      setSelectedId(saved.id)
      setDraft(saved)
      setStatus('idle')
      setErrorMessage('')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '저장하지 못했습니다.')
    }
  }

  async function handleManualSave() {
    await persistDraft(draft)
  }

  async function handleDelete() {
    if (!draft.id) return
    const confirmDelete = window.confirm('이 메모를 삭제할까요?')
    if (!confirmDelete) return
    await noteRepository.removeNote(draft.id, currentUserId)
    const nextNotes = notes.filter((note) => note.id !== draft.id)
    setNotes(nextNotes)
    if (nextNotes[0]) {
      setSelectedId(nextNotes[0].id)
      setDraft(nextNotes[0])
      lastPersistedSignature.current = buildSignature(nextNotes[0])
    } else {
      const blank = createBlankNote(currentUserId)
      setSelectedId(blank.id)
      setDraft(blank)
      setNotes([blank])
      lastPersistedSignature.current = buildSignature(blank)
    }
  }

  async function handleUploadImage(file: File): Promise<NoteImage> {
    const noteId = draft.id
    const uploaded = await noteRepository.uploadNoteImage(noteId, file, currentUserId)
    setDraft((current) => ({ ...current, images: [...current.images, uploaded], updatedAt: nowIso() }))
    return uploaded
  }

  return (
    <Layout
      notes={filteredNotes}
      selectedId={selectedId}
      query={query}
      theme={theme}
      onQueryChange={setQuery}
      onSelect={handleSelect}
      onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      onNewNote={handleNewNote}
    >
      <section className="statusRow">
        <span className={`statusBadge ${status}`}>{status === 'saving' ? '저장 중' : status === 'loading' ? '불러오는 중' : status === 'error' ? '오류' : '준비됨'}</span>
        <button className="ghostButton" type="button" onClick={handleManualSave}>
          저장 버튼
        </button>
      </section>

      {errorMessage ? <div className="errorBanner">{errorMessage}</div> : null}

      <Editor
        note={draft}
        theme={theme}
        onChange={handleDraftChange}
        onSave={handleManualSave}
        onDelete={handleDelete}
        onUploadImage={handleUploadImage}
      />
    </Layout>
  )
}

function buildSignature(note: Pick<Note, 'userId' | 'title' | 'content' | 'canvasData' | 'images'>) {
  return JSON.stringify({
    userId: note.userId,
    title: note.title,
    content: note.content,
    canvasData: note.canvasData,
    images: note.images,
  })
}
