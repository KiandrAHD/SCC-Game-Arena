import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { LogIn, Mail, Lock, Gamepad2, Home } from 'lucide-react'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!supabase) {
        setError('Layanan login belum dikonfigurasi. Periksa konfigurasi Supabase aplikasi.')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      })
      if (signInError) {
        setError('Email atau kata sandi tidak valid.')
        return
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Sesi login tidak dapat diverifikasi. Silakan coba lagi.')
        return
      }

      const { data: admin, error: membershipError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .in('role', ['admin', 'super_admin'])
        .maybeSingle()

      if (membershipError) {
        setError('Verifikasi akses admin gagal. Periksa schema dan izin Supabase.')
        return
      }

      if (!admin) {
        await supabase.auth.signOut()
        setError('Akun ini tidak memiliki akses admin.')
        return
      }

      navigate('/admin', { replace: true })
    } catch {
      setError('Login gagal karena gangguan layanan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-primary font-bold text-xl mb-4">
            <Gamepad2 className="w-7 h-7" />
            <span>SCC Admin</span>
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">Login Admin</h1>
          <p className="text-sm text-muted">
            Masuk untuk mengelola kompetisi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="admin@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
          />

          <Input
            label="Kata Sandi"
            name="password"
            type="password"
            placeholder="Masukkan kata sandi"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isSubmitting}
            icon={LogIn}
          >
            Masuk
          </Button>
        </form>
        <Link to="/" className="mt-4 flex items-center justify-center gap-2 text-sm text-muted hover:text-text transition-colors">
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </Card>
    </div>
  )
}
