import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Settings, 
  LogOut,
  Gamepad2 
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/participants', label: 'Peserta', icon: Users },
  { path: '/admin/results', label: 'Hasil', icon: Trophy },
  { path: '/admin/settings', label: 'Pengaturan', icon: Settings },
]

export default function AdminLayout() {
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const isLoginPage = location.pathname === '/admin/login'

  // Redirect to login if not authenticated (placeholder logic)
  // TODO: Implement proper auth check with Supabase
  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to="/admin/login" replace />
  }

  // Don't show sidebar on login page
  if (isLoginPage) {
    return <Outlet />
  }

  const isActive = (path, end = false) => {
    if (end) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link to="/admin" className="flex items-center gap-2 font-bold text-lg">
            <Gamepad2 className="w-6 h-6 text-primary" />
            <span>SCC Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map(({ path, label, icon: Icon, end }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActive(path, end) 
                      ? 'bg-primary text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
