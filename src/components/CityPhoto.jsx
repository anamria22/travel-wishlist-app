import { useState, useEffect } from 'react'

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY

export default function CityPhoto({ city, country }) {
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPhoto(null)
    setLoading(true)
    const query = country ? `${city} ${country}` : city
    fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_KEY}`)
      .then(r => r.json())
      .then(data => {
        const result = data.results?.[0]
        if (result) setPhoto({ url: result.urls.regular, author: result.user.name, authorLink: result.user.links.html })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [city, country])

  if (loading) return <div className="city-photo-skeleton" />
  if (!photo) return null

  return (
    <div className="city-photo-wrapper">
      <img src={photo.url} alt={city} className="city-photo" />
      <span className="photo-credit">
          <a href={photo.authorLink} target="_blank" rel="noreferrer">{photo.author}</a> pe Unsplash
      </span>
    </div>
  )
}
