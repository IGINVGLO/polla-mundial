import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Home from '@/pages/Home'
import Predicciones from '@/pages/Predicciones'
import PrediccionesEspeciales from '@/pages/PrediccionesEspeciales'
import Ranking from '@/pages/Ranking'
import MiPerfil from '@/pages/MiPerfil'
import AdminPanel from '@/pages/admin/AdminPanel'

export default function App() {
  const inicializar = useAuthStore((s) => s.inicializar)

  useEffect(() => {
    inicializar()
  }, [inicializar])

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas — usan el Layout con Navbar */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="predicciones" element={<Predicciones />} />
          <Route path="predicciones-especiales" element={<PrediccionesEspeciales />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="perfil" element={<MiPerfil />} />

          {/* Solo admin */}
          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
