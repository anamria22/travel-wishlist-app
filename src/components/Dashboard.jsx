import { useState, useEffect } from 'react'
import { auth, db } from '../firebase'
import { signOut } from 'firebase/auth'
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, query, where, serverTimestamp
} from 'firebase/firestore'
import WeatherWidget from './WeatherWidget'
import CityAutocomplete from './CityAutocomplete'
import CityPhoto from './CityPhoto'

export default function Dashboard({ user }) {
  const [destinations, setDestinations] = useState([])
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [note, setNote] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)

  useEffect(() => {
    const q = query(
      collection(db, 'destinations'),
      where('uid', '==', user.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      setDestinations(docs)
    }, (err) => {
      console.error('Firestore error:', err)
    })
    return unsub
  }, [user.uid])

  const addDestination = async (e) => {
    e.preventDefault()
    if (!city.trim()) return
    await addDoc(collection(db, 'destinations'), {
      uid: user.uid,
      city: city.trim(),
      country: country.trim(),
      note: note.trim(),
      createdAt: serverTimestamp()
    })
    setCity('')
    setCountry('')
    setNote('')
  }

  const removeDestination = async (id) => {
    await deleteDoc(doc(db, 'destinations', id))
    if (selectedCity?.id === id) setSelectedCity(null)
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>✈️ Travel Wishlist</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button className="btn-logout" onClick={() => signOut(auth)}>Deconectare</button>
        </div>
      </header>

      <div className="dash-content">
        <div className="left-panel">
          <form className="add-form" onSubmit={addDestination}>
            <h2>Adauga destinatie</h2>
            <CityAutocomplete
              value={city}
              onChange={setCity}
              onSelect={(c, ctry) => { setCity(c); setCountry(ctry) }}
            />
            <input
              placeholder="Tara"
              value={country}
              onChange={e => setCountry(e.target.value)}
            />
            <textarea
              placeholder="Notite (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
            <button type="submit" className="btn-primary">Adauga</button>
          </form>

          <div className="destinations-list">
            <h2>Lista mea ({destinations.length})</h2>
            {destinations.length === 0 && (
              <p className="empty">Nicio destinație adăugată încă.</p>
            )}
            {destinations.map(dest => (
              <div
                key={dest.id}
                className={`dest-card ${selectedCity?.id === dest.id ? 'active' : ''}`}
                onClick={() => setSelectedCity(dest)}
              >
                <div className="dest-info">
                  <strong>{dest.city}</strong>
                  {dest.country && <span className="country">, {dest.country}</span>}
                  {dest.note && <p className="dest-note">{dest.note}</p>}
                </div>
                <button
                  className="btn-delete"
                  onClick={(e) => { e.stopPropagation(); removeDestination(dest.id) }}
                >🗑️</button>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          {selectedCity ? (
            <div className="right-panel-inner">
              <CityPhoto city={selectedCity.city} country={selectedCity.country} />
              <WeatherWidget city={selectedCity.city} country={selectedCity.country} />
            </div>
          ) : (
            <div className="weather-placeholder">
              <p>Selecteaza o destinatie pentru a vedea detaliile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
