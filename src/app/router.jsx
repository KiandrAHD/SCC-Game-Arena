import PublicLayout from '../components/layout/PublicLayout'
import AdminLayout from '../components/layout/AdminLayout'

// Public pages
import LandingPage from '../pages/public/LandingPage'
import RegisterPage from '../pages/public/RegisterPage'
import RulesPage from '../pages/public/RulesPage'
import ReflexRushPage from '../pages/public/ReflexRushPage'
import MemoryRushPage from '../pages/public/MemoryRushPage'
import QuizBlitzPage from '../pages/public/QuizBlitzPage'
import ResultPage from '../pages/public/ResultPage'
import LeaderboardPage from '../pages/public/LeaderboardPage'

// Admin pages
import AdminLoginPage from '../pages/admin/AdminLoginPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminParticipantsPage from '../pages/admin/AdminParticipantsPage'
import AdminResultsPage from '../pages/admin/AdminResultsPage'
import AdminSettingsPage from '../pages/admin/AdminSettingsPage'

export const routes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'rules', element: <RulesPage /> },
      { path: 'play/reflex', element: <ReflexRushPage /> },
      { path: 'play/memory', element: <MemoryRushPage /> },
      { path: 'play/quiz', element: <QuizBlitzPage /> },
      { path: 'result', element: <ResultPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'login', element: <AdminLoginPage /> },
      { path: 'participants', element: <AdminParticipantsPage /> },
      { path: 'results', element: <AdminResultsPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
]
