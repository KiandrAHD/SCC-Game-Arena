import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Trophy,
  Settings,
  Activity,
  LogOut,
  Gamepad2,
  Home,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/participants', label: 'Peserta', icon: Users },
  { path: '/admin/activities', label: 'Aktivitas Peserta', icon: Activity },
  { path: '/admin/results', label: 'Hasil', icon: Trophy },
  { path: '/admin/settings', label: 'Pengaturan', icon: Settings },
]

async function getAdminState(user) {
  if (!user || !supabase) return false
  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .in('role', ['admin', 'super_admin'])
    .maybeSingle()
  return !error && Boolean(data)
}

export default function AdminLayout() {
  const location = useLocation()
  const [authState, setAuthState] = useState('loading')
  const isLoginPage = location.pathname === '/admin/login'

  useEffect(() => {
    if (!supabase) {
      setAuthState('unauthenticated')
      return undefined
    }

    let mounted = true
    const restoreSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        if (mounted) setAuthState('unauthenticated')
        return
      }
      const isAdmin = await getAdminState(user)
      if (mounted) setAuthState(isAdmin ? 'authenticated' : 'unauthenticated')
    }

    restoreSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        if (mounted) setAuthState('unauthenticated')
        return
      }
      getAdminState(session.user).then((isAdmin) => {
        if (mounted) setAuthState(isAdmin ? 'authenticated' : 'unauthenticated')
      })
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (isLoginPage) return <Outlet />
  if (authState === 'loading') {
    return <div className="min-h-screen bg-background flex items-center justify-center">Memeriksa sesi...</div>
  }
  if (authState !== 'authenticated') return <Navigate to="/admin/login" replace />

  const isActive = (path, end = false) => end ? location.pathname === path : location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-dark text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link to="/admin" className="flex items-center gap-2 font-bold text-lg"><Gamepad2 className="w-6 h-6 text-primary" /><span>SCC Admin</span></Link><Link to="/" className="flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"><Home className="w-5 h-5" /><span>Kembali ke Beranda</span></Link>
        </div>
        <nav className="flex-1 p-4"><ul className="space-y-1">
          {navItems.map(({ path, label, icon: Icon, end }) => (
            <li key={path}><Link to={path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(path, end) ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}><Icon className="w-5 h-5" /><span>{label}</span></Link></li>
          ))}
        </ul></nav>
        <div className="p-4 border-t border-gray-700"><button onClick={() => supabase?.auth.signOut()} className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"><LogOut className="w-5 h-5" /><span>Keluar</span></button></div>
      </aside>
      <main className="flex-1 p-8"><Outlet /></main>
    </div>
  )
}
