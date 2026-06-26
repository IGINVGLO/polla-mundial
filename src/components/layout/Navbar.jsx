import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function Navbar() {
  const { user, perfil, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
        : 'text-slate-600 hover:text-slate-900'
    }`

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg">
          <span className="text-2xl">⚽</span>
          <span className="hidden sm:inline">Polla Mundial 2026</span>
          <span className="sm:hidden">PM26</span>
        </Link>

        {/* Nav links — solo cuando hay sesión */}
        {user && (
          <nav className="flex items-center gap-5">
            <NavLink to="/" end className={navLinkClass}>Inicio</NavLink>
            <NavLink to="/predicciones" className={navLinkClass}>Mis Picks</NavLink>
            <NavLink to="/grupos" className={navLinkClass}>Grupos</NavLink>
            <NavLink to="/predicciones-especiales" className={navLinkClass}>Especiales</NavLink>
            <NavLink to="/ranking" className={navLinkClass}>Ranking</NavLink>
            {isAdmin() && (
              <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
            )}
          </nav>
        )}

        {/* Usuario / logout */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NavLink to="/perfil" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:block">
                {perfil?.alias ?? user.email}
              </NavLink>
              <button onClick={handleLogout} className="btn-secondary text-xs py-1.5 px-3">
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-1.5 px-4">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
