import { useState } from 'react'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>✈️ Travel Wishlist</h1>
        <p className="subtitle">Salveaza destinatiile tale de vis</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Parola"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary">
            {isRegister ? 'Creeaza cont' : 'Autentificare'}
          </button>
        </form>
        <p className="toggle-auth">
          {isRegister ? 'Ai deja cont?' : 'Nu ai cont?'}
          <button className="btn-link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? ' Autentifica-te' : ' Inregistreaza-te'}
          </button>
        </p>
      </div>
    </div>
  )
}
