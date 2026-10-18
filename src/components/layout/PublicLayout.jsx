import { Outlet, Link, useLocation } from 'react-router-dom'
import { Gamepad2, Trophy, LogIn } from 'lucide-react'

export default function PublicLayout() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-background">
      {!isAdminRoute && (
        <header className="sticky top-0 z-50 bg-surface border-b border-border">
          <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
              <Gamepad2 className="w-7 h-7" />
              <span>SCC Game Arena</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/leaderboard"
                className="flex items-center gap-1.5 px-3 py-2 text-muted hover:text-text transition-colors"
              >
                <Trophy className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Leaderboard</span>
              </Link>
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 px-3 py-2 text-muted hover:text-text transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Admin</span>
              </Link>
            </div>
          </nav>
        </header>
      )}
      <main>
        <Outlet />
      </main>
      {!isAdminRoute && (
        <footer className="py-6 text-center text-sm text-muted border-t border-border bg-surface">
          <p>SCC Game Arena &copy; 2026 &mdash; SMK Telkom Purwokerto</p>
        </footer>
      )}
    </div>
  )
}
