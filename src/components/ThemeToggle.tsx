import type { ThemeMode } from '../types'

type Props = {
  theme: ThemeMode
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button className="ghostButton" type="button" onClick={onToggle}>
      {theme === 'dark' ? '라이트 모드' : '다크 모드'}
    </button>
  )
}
