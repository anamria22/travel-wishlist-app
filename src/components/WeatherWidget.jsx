import { useState, useEffect } from 'react'

const WMO_CODES = {
  0: { label: 'Cer senin', emoji: '☀️' },
  1: { label: 'Predominant senin', emoji: '🌤️' },
  2: { label: 'Partial noros', emoji: '⛅' },
  3: { label: 'Noros', emoji: '☁️' },
  45: { label: 'Ceata', emoji: '🌫️' },
  48: { label: 'Ceata cu chiciura', emoji: '🌫️' },
  51: { label: 'Burnita usoara', emoji: '🌦️' },
  53: { label: 'Burnita moderata', emoji: '🌦️' },
  55: { label: 'Burnita densa', emoji: '🌧️' },
  61: { label: 'Ploaie usoara', emoji: '🌧️' },
  63: { label: 'Ploaie moderata', emoji: '🌧️' },
  65: { label: 'Ploaie abundenta', emoji: '🌧️' },
  71: { label: 'Ninsoare usoara', emoji: '❄️' },
  73: { label: 'Ninsoare moderata', emoji: '❄️' },
  75: { label: 'Ninsoare abundenta', emoji: '❄️' },
  80: { label: 'Averse usoare', emoji: '🌦️' },
  81: { label: 'Averse moderate', emoji: '🌧️' },
  82: { label: 'Averse violente', emoji: '⛈️' },
  95: { label: 'Furtuna', emoji: '⛈️' },
  99: { label: 'Furtuna cu grindina', emoji: '⛈️' },
}

export default function WeatherWidget({ city, country }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    setWeather(null)

    const geoQuery = country ? `${city},${country}` : city

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(geoQuery)}&count=1&language=en`)
      .then(r => r.json())
      .then(async geoData => {
        if (!geoData.results?.length) throw new Error('Orasul nu a fost gasit.')
        const { latitude, longitude, country: apiCountry } = geoData.results[0]
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weathercode,visibility` +
          `&wind_speed_unit=kmh&timezone=auto`
        )
        const data = await res.json()
        setWeather({ ...data.current, name: city, geoCountry: country || apiCountry || '' })
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Nu s-au putut incarca datele meteo.')
        setLoading(false)
      })
  }, [city, country])

  if (loading) return <div className="weather-card"><p>Se incarca vremea...</p></div>
  if (error) return <div className="weather-card"><p className="error">{error}</p></div>

  const code = weather.weathercode ?? 0
  const condition = WMO_CODES[code] ?? { label: 'Necunoscut', emoji: '🌡️' }

  return (
    <div className="weather-card">
      <h2>Vremea in {weather.name}{weather.geoCountry ? `, ${weather.geoCountry}` : ''}</h2>
      <div className="weather-main">
        <span style={{ fontSize: '4rem' }}>{condition.emoji}</span>
        <div className="temp">{Math.round(weather.temperature_2m)}°C</div>
      </div>
      <p className="weather-desc">{condition.label}</p>
      <div className="weather-details">
        <div><span>Umiditate</span><strong>{weather.relative_humidity_2m}%</strong></div>
        <div><span>Vant</span><strong>{Math.round(weather.wind_speed_10m)} km/h</strong></div>
        <div><span>Simte ca</span><strong>{Math.round(weather.apparent_temperature)}°C</strong></div>
        <div><span>Vizibilitate</span><strong>{weather.visibility != null ? (weather.visibility / 1000).toFixed(1) + ' km' : 'N/A'}</strong></div>
      </div>
    </div>
  )
}
