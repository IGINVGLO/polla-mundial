import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BannerAviso from '@/components/ui/BannerAviso'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <BannerAviso />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-slate-400 py-4">
        Polla Mundial 2026 · Hecho con ⚽
      </footer>
    </div>
  )
}
