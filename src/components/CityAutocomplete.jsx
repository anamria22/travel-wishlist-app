import { useState, useEffect, useRef } from 'react'

export default function CityAutocomplete({ value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([])
  const [show, setShow] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (value.length < 2) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=5&language=en`)
        .then(r => r.json())
        .then(data => setSuggestions(data.results || []))
    }, 300)
  }, [value])

  const handleSelect = (item) => {
    onSelect(item.name, item.country)
    setSuggestions([])
    setShow(false)
  }

  return (
    <div className="autocomplete-wrapper">
      <input
        placeholder="Oras *"
        value={value}
        onChange={e => { onChange(e.target.value); setShow(true) }}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        onFocus={() => setShow(true)}
        required
        autoComplete="off"
      />
      {show && suggestions.length > 0 && (
        <ul className="autocomplete-list">
          {suggestions.map(s => (
            <li key={s.id} onMouseDown={() => handleSelect(s)}>
              {s.name}{s.admin1 ? `, ${s.admin1}` : ''}, {s.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
