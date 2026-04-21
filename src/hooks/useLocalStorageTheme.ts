import { useEffect, useState } from 'react'
import type { ThemeMode } from '../types'

const themeKey = 'noteapad-theme'

export function useLocalStorageTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(themeKey)
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    localStorage.setItem(themeKey, theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  return { theme, setTheme }
}
