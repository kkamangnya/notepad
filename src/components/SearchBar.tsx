type Props = {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <label className="searchBar">
      <span className="srOnly">메모 검색</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="제목 또는 본문 검색"
      />
    </label>
  )
}
