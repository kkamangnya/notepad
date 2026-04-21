import { getApps, initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously, type Auth } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString, type FirebaseStorage } from 'firebase/storage'
import type { Note, NoteImage, SaveNoteInput } from '../types'
import { nowIso } from './date'

type FirebaseEnv = {
  apiKey?: string
  authDomain?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
}

const env: FirebaseEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(env.apiKey && env.projectId && env.appId)

function getAppsOrCreate() {
  if (getApps().length) return getApps()[0]
  if (!isFirebaseConfigured) return null
  return initializeApp({
    apiKey: env.apiKey,
    authDomain: env.authDomain,
    projectId: env.projectId,
    storageBucket: env.storageBucket,
    messagingSenderId: env.messagingSenderId,
    appId: env.appId,
  })
}

const app = getAppsOrCreate()
const auth: Auth | null = app ? getAuth(app) : null
const db: Firestore | null = app ? getFirestore(app) : null
const storage: FirebaseStorage | null = app ? getStorage(app) : null

let cachedUserId = ''
let authReady: Promise<string> | null = null

function localKey(userId: string) {
  return `noteapad-local-notes-${userId || 'guest'}`
}

function readLocalNotes(userId: string): Note[] {
  const raw = localStorage.getItem(localKey(userId))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Note[]
    return Array.isArray(parsed) ? parsed.filter((note) => note.userId === userId) : []
  } catch {
    return []
  }
}

function writeLocalNotes(userId: string, notes: Note[]) {
  localStorage.setItem(localKey(userId), JSON.stringify(notes))
}

export async function ensureFirebaseAuth() {
  if (!auth) return ''
  if (cachedUserId) return cachedUserId
  if (authReady) return authReady

  authReady = new Promise<string>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        cachedUserId = user.uid
        unsubscribe()
        resolve(user.uid)
        return
      }

      try {
        const credential = await signInAnonymously(auth)
        cachedUserId = credential.user.uid
        unsubscribe()
        resolve(credential.user.uid)
      } catch (error) {
        unsubscribe()
        reject(
          new Error(
            'Firebase Anonymous Auth가 비활성화되어 있거나 로그인에 실패했습니다. Firebase Console에서 Authentication > Sign-in method > Anonymous를 켜세요.',
          ),
        )
      }
    })
  })

  return authReady
}

export function getCurrentUserId() {
  return cachedUserId
}

export async function listNotes(userId: string): Promise<Note[]> {
  if (!db) {
    return readLocalNotes(userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  const snapshot = await getDocs(query(collection(db, 'users', userId, 'notes'), orderBy('updatedAt', 'desc')))
  return snapshot.docs.map((item) => item.data() as Note)
}

export async function saveNote(input: SaveNoteInput, userId: string): Promise<Note> {
  const note: Note = {
    id: input.id ?? crypto.randomUUID(),
    userId,
    title: input.title.trim() || '새 메모',
    content: input.content,
    canvasData: input.canvasData,
    images: input.images,
    createdAt: input.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  }

  if (!db) {
    const existing = readLocalNotes(userId).filter((item) => item.id !== note.id)
    existing.unshift(note)
    writeLocalNotes(userId, existing.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
    return note
  }

  if (storage) {
    const canvasRef = ref(storage, `users/${userId}/notes/${note.id}/canvas/canvas.json`)
    await uploadString(canvasRef, note.canvasData, 'raw')
  }

  await setDoc(doc(db, 'users', userId, 'notes', note.id), note, { merge: false })
  return note
}

export async function removeNote(noteId: string, userId: string) {
  if (!db) {
    const next = readLocalNotes(userId).filter((item) => item.id !== noteId)
    writeLocalNotes(userId, next)
    return
  }

  await deleteDoc(doc(db, 'users', userId, 'notes', noteId))
}

export async function uploadNoteImage(noteId: string, file: File, userId: string): Promise<NoteImage> {
  const imageId = crypto.randomUUID()
  if (!storage) {
    const url = await fileToDataUrl(file)
    return {
      id: imageId,
      url,
      x: 120,
      y: 120,
      scale: 1,
      rotation: 0,
      width: 320,
      height: 320,
      name: file.name,
    }
  }

  const path = `users/${userId}/notes/${noteId}/images/${imageId}-${file.name}`
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file)
  const url = await getDownloadURL(fileRef)
  return {
    id: imageId,
    url,
    x: 120,
    y: 120,
    scale: 1,
    rotation: 0,
    width: 320,
    height: 320,
    name: file.name,
  }
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'))
    reader.readAsDataURL(file)
  })
}

export const noteRepository = {
  ensureFirebaseAuth,
  getCurrentUserId,
  listNotes,
  saveNote,
  removeNote,
  uploadNoteImage,
}
