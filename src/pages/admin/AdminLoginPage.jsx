import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { LogIn, Mail, Lock, Gamepad2 } from 'lucide-react'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Placeholder - TODO: Implement Supabase Auth
    setTimeout(() => {
      setIsSubmitting(false)
      setError('Fitur login belum tersedia. Konfigurasi Supabase Auth terlebih dahulu.')
    }, 500)
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
      </Card>
    </div>
  )
}
