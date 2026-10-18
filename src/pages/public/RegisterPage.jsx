import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { User, Hash, BookOpen, ArrowRight } from 'lucide-react'

const CLASS_OPTIONS = [
  { value: '', label: 'Pilih kelas' },
  { value: 'IXA', label: 'IX A' },
  { value: 'IXB', label: 'IX B' },
  { value: 'IXC', label: 'IX C' },
  { value: 'IXD', label: 'IX D' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    attendanceNumber: '',
    className: '',
    agreeToRules: false,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi'
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Nama minimal 3 karakter'
    }
    if (!formData.attendanceNumber) {
      newErrors.attendanceNumber = 'Nomor absen wajib diisi'
    } else if (isNaN(formData.attendanceNumber) || parseInt(formData.attendanceNumber) < 1) {
      newErrors.attendanceNumber = 'Nomor absen harus berupa angka positif'
    }
    if (!formData.className) {
      newErrors.className = 'Kelas wajib dipilih'
    }
    if (!formData.agreeToRules) {
      newErrors.agreeToRules = 'Kamu harus menyetujui aturan kompetisi'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    
    // Placeholder - belum ada backend integration
    // TODO: Implement registration with Supabase
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Fitur registrasi belum tersedia. Backend belum dikonfigurasi.')
    }, 500)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text mb-2">Daftar Peserta</h1>
          <p className="text-sm text-muted">
            Isi data diri untuk mulai bermain. Tidak perlu buat akun.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            name="fullName"
            placeholder="Masukkan nama lengkap"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            icon={User}
          />

          <Input
            label="Nomor Absen"
            name="attendanceNumber"
            type="number"
            placeholder="Contoh: 01"
            value={formData.attendanceNumber}
            onChange={handleChange}
            error={errors.attendanceNumber}
            icon={Hash}
            min="1"
            max="40"
          />

          <div className="w-full">
            <label className="block text-sm font-semibold text-text mb-1.5">
              Kelas
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
              <select
                name="className"
                value={formData.className}
                onChange={handleChange}
                className={`
                  w-full px-4 py-2.5 pl-10 rounded-lg border bg-surface text-text
                  appearance-none cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  ${errors.className ? 'border-red-500' : 'border-border'}
                `}
              >
                {CLASS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.className && (
              <p className="mt-1.5 text-sm text-red-500">{errors.className}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agreeToRules"
              name="agreeToRules"
              checked={formData.agreeToRules}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="agreeToRules" className="text-sm text-text">
              Saya menyetujui{' '}
              <Link to="/rules" className="text-primary hover:underline">
                aturan kompetisi
              </Link>
            </label>
          </div>
          {errors.agreeToRules && (
            <p className="text-sm text-red-500">{errors.agreeToRules}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isSubmitting}
            icon={ArrowRight}
          >
            Mulai Bermain
          </Button>
        </form>

        <p className="mt-4 text-xs text-center text-muted">
          Dengan mendaftar, kamu menyetujui penggunaan data untuk keperluan kompetisi.
        </p>
      </Card>
    </div>
  )
}
