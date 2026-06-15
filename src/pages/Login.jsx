import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'
  const resetOk = location.state?.resetOk ?? false

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resetMsg, setResetMsg] = useState(null)

  const handleReset = async () => {
    if (!email.trim()) {
      setResetMsg({ type: 'error', msg: 'Ingresa tu email primero' })
      return
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://polla-mundial-peach.vercel.app/reset-password',
    })
    if (err) {
      setResetMsg({ type: 'error', msg: err.message })
    } else {
      setResetMsg({ type: 'ok', msg: 'Te enviamos un link de recuperación a tu email' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      navigate(from, { replace: true })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Ingresar ⚽</h1>
        <p className="text-sm text-slate-500 mb-6">Polla Mundial 2026</p>

        {resetOk && (
          <p className="text-sm bg-green-50 text-green-700 rounded-lg px-3 py-2 mb-4">
            Contraseña actualizada, ya puedes ingresar
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-blue-600 hover:underline mt-1 block"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {resetMsg && (
            <p
              className={`text-sm px-3 py-2 rounded-lg ${
                resetMsg.type === 'ok'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {resetMsg.msg}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
