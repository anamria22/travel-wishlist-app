import { useState, useEffect } from 'react'

const CATEGORY_ICONS = {
  museum: '🏛️',
  attraction: '📍',
  artwork: '🎨',
  gallery: '🖼️',
  monument: '🗿',
  ruins: '🏚️',
  viewpoint: '🔭',
  theme_park: '🎢',
  zoo: '🦁',
  aquarium: '🐠',
  default: '📌',
}

export default function PlacesWidget({ city, country }) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    setPlaces([])

    const geoQuery = country ? `${city},${country}` : city

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(geoQuery)}&count=1`)
      .then(r => r.json())
      .then(async geoData => {
        if (!geoData.results?.length) throw new Error('Orasul nu a fost gasit.')
        const { latitude, longitude } = geoData.results[0]

        const overpassQuery = `
          [out:json][timeout:10];
          (
            node["tourism"~"attraction|museum|gallery|monument|artwork|viewpoint|theme_park|zoo|aquarium"](around:8000,${latitude},${longitude});
          );
          out body 12;
        `
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: overpassQuery,
        })
        const data = await res.json()

        const results = data.elements
          .filter(el => el.tags?.name)
          .map(el => ({
            id: el.id,
            name: el.tags['name:en'] || el.tags['name:ro'] || el.tags.name,
            type: el.tags.tourism || 'attraction',
            website: el.tags.website || el.tags['contact:website'] || null,
            wikipedia: el.tags.wikipedia || el.tags['wikipedia:en'] || null,
          }))

        if (results.length === 0) throw new Error('Nu s-au gasit locuri de vizitat.')
        setPlaces(results)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Eroare la incarcarea locurilor.')
        setLoading(false)
      })
  }, [city, country])

  return (
    <div className="places-card">
      <h2>Locuri de vizitat in {city}</h2>
      {loading && <p className="places-loading">Se incarca locurile...</p>}
      {error && <p className="error">{error}</p>}
      <ul className="places-list">
        {places.map(place => {
          const icon = CATEGORY_ICONS[place.type] ?? CATEGORY_ICONS.default
          const link = place.website || (place.wikipedia
            ? `https://ro.wikipedia.org/wiki/${place.wikipedia.replace(/^ro:/, '')}`
            : null)
          return (
            <li key={place.id} className="place-item">
              <span className="place-icon">{icon}</span>
              <div className="place-info">
                {link ? (
                  <a href={link} target="_blank" rel="noreferrer">{place.name}</a>
                ) : (
                  <span>{place.name}</span>
                )}
                <small>{place.type}</small>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
