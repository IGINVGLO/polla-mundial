import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError(err.message)
    } else {
      navigate('/login', { state: { resetOk: true } })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Nueva contraseña ⚽</h1>
        <p className="text-sm text-slate-500 mb-6">Ingresa tu nueva contraseña</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="input"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
