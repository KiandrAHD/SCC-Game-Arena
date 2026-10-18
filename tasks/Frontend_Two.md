# Task Document: Frontend Implementation — Admin Dashboard

**Ditujukan untuk:** Rafa (Frontend Engineer)
**Prioritas:** Tinggi
**Estimasi:** 4-5 hari kerja

---

## 1. Tujuan

Mengimplementasikan seluruh halaman admin untuk SCC Game Arena: login admin, dashboard, manajemen peserta, leaderboard admin, pengaturan kompetisi, dan ekspor CSV. Semua harus terintegrasi dengan backend Supabase dan dilindungi dengan autentikasi.

---

## 2. Konteks

- **Stack:** React 18.3.1, Vite 5.4.10, Tailwind CSS 3.4.14, Lucide React 0.460.0
- **Backend:** Supabase dengan Auth (dikelola Kiandra)
- **Target:** Desktop-first (1440×900), admin operation

Repository saat ini:
- Semua halaman admin sudah ada di `src/app/router.jsx`
- Layout admin ada di `src/components/layout/AdminLayout.jsx`
- Login admin masih placeholder
- Dashboard dan halaman lain belum terhubung backend
- Supabase client ada di `src/lib/supabase.js`

---

## 3. Ruang Lingkup

### Termasuk

1. **Login admin** — Form login dengan Supabase Auth
2. **Dashboard admin** — Statistik ringkasan, aktivitas terbaru
3. **Manajemen peserta** — Tabel, search, filter, detail
4. **Leaderboard admin** — Tabel peringkat dengan tie-break
5. **Pengaturan kompetisi** — Status, konfigurasi, modal konfirmasi
6. **Ekspor CSV** — Download data peserta dan hasil
7. **Route guard** — Proteksi halaman admin

### Tidak Termasuk

- Halaman peserta (tanggung jawab Rama)
- Backend implementation (tanggung jawab Kiandra)
- Database schema dan RLS policies

---

## 4. Kondisi Repository Saat Ini

| Halaman | Status | Keterangan |
|---------|--------|------------|
| Admin Login | ⚠️ Placeholder | `src/pages/admin/AdminLoginPage.jsx` — belum terhubung Auth |
| Admin Dashboard | ⚠️ Placeholder | `src/pages/admin/AdminDashboardPage.jsx` — data mockup |
| Admin Participants | ⚠️ Placeholder | `src/pages/admin/AdminParticipantsPage.jsx` — belum ada tabel |
| Admin Leaderboard | ⚠️ Placeholder | `src/pages/admin/AdminLeaderboardPage.jsx` — belum ada tabel |
| Admin Settings | ⚠️ Placeholder | `src/pages/admin/AdminSettingsPage.jsx` — belum ada kontrol |

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Admin Layout | ✅ Ada | `src/components/layout/AdminLayout.jsx` |
| Sidebar | ⚠️ Perlu cek | Navigasi admin |
| DataTable | ❌ Belum ada | Perlu dibuat |

---

## 5. Prasyarat

- [ ] Backend API sudah berjalan (koordinasi dengan Kiandra)
- [ ] Akun admin sudah dibuat di Supabase Auth
- [ ] `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah dikonfigurasi
- [ ] Daftar kelas dan rentang nomor absen

---

## 6. Fase Implementasi

### Fase 1: Autentikasi Admin & Route Guard (1 hari)

**Tujuan:** Implementasi login dengan Supabase Auth dan proteksi halaman admin.

#### Login Page

**Field:**
- Email admin
- Kata sandi
- Checkbox "Ingat saya" (opsional)

**Proses login:**

```javascript
import { supabase } from '@/lib/supabase';

const handleLogin = async (email, password) => {
  setLoading(true);
  setError(null);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Cek apakah user adalah admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (adminError || !adminData) {
      await supabase.auth.signOut();
      throw new Error('Akun tidak memiliki akses admin');
    }

    // Redirect ke dashboard
    navigate('/admin');

  } catch (err) {
    // Jangan reveal apakah email ada atau tidak
    setError('Email atau kata sandi salah');
  } finally {
    setLoading(false);
  }
};
```

**Logout:**

```javascript
const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate('/admin/login');
};
```

#### Route Guard

**Buat AuthContext:**

```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId) => {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    setIsAdmin(!!data);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Protected Route Component:**

```javascript
// src/components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
```

**Update Router:**

```javascript
// src/app/router.jsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Di dalam Routes
<Route path="/admin/login" element={<AdminLoginPage />} />
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboardPage />} />
  <Route path="participants" element={<AdminParticipantsPage />} />
  <Route path="leaderboard" element={<AdminLeaderboardPage />} />
  <Route path="settings" element={<AdminSettingsPage />} />
</Route>
```

#### Checklist Fase 1

- [ ] Login form dengan validasi
- [ ] Supabase Auth signInWithPassword bekerja
- [ ] Cek status admin di tabel admin_users
- [ ] Route guard melindungi semua halaman /admin
- [ ] Logout bekerja
- [ ] Session persistence (refresh tidak logout)

---

### Fase 2: Admin Dashboard (1 hari)

**Tujuan:** Menampilkan ringkasan statistik dan aktivitas terbaru.

#### Elemen Dashboard

1. **Header**
   - "Dashboard SCC Game Arena"
   - Status kompetisi badge (draft/open/closed)
   - Tombol "Refresh"

2. **Statistik cards (4 card)**
   - Total Peserta
   - Peserta Selesai
   - Peserta Sedang Bermain
   - Rata-rata Skor

3. **Leaderboard ringkas**
   - Top 5 peserta
   - Tombol "Lihat Semua" → `/admin/leaderboard`

4. **Aktivitas terbaru**
   - List 10 aktivitas terakhir (registrasi, submit game, dll)
   - Timestamp relatif ("5 menit yang lalu")

5. **Quick actions**
   - Tombol "Ekspor Hasil" → download CSV
   - Tombol "Pengaturan" → `/admin/settings`

#### Data dari backend

```javascript
const fetchDashboard = async () => {
  const { data, error } = await supabase.functions.invoke('get-admin-dashboard');

  if (error) {
    setError('Gagal memuat data dashboard');
    return;
  }

  setStats(data.statistics);
  setTopParticipants(data.top_10.slice(0, 5));
  setRecentActivity(data.recent_activity);
};
```

#### Auto-refresh (opsional)

```javascript
useEffect(() => {
  fetchDashboard();

  // Refresh setiap 30 detik
  const interval = setInterval(fetchDashboard, 30000);

  return () => clearInterval(interval);
}, []);
```

#### Checklist Fase 2

- [ ] 4 statistik cards dengan data real
- [ ] Top 5 leaderboard preview
- [ ] Aktivitas terbaru list
- [ ] Quick actions bekerja
- [ ] Auto-refresh (opsional)
- [ ] Loading dan error state

---

### Fase 3: Manajemen Peserta (1.5 hari)

**Tujuan:** Tabel peserta dengan search, filter, dan detail.

#### Tabel Peserta

**Kolom:**

| Kolom | Deskripsi |
|-------|-----------|
| Nama | Display name peserta |
| Kelas | Kelas peserta |
| Status | registered/playing/completed |
| Reflex Rush | Skor atau "-" jika belum |
| Memory Rush | Skor atau "-" jika belum |
| Quiz Blitz | Skor atau "-" jika belum |
| Total | Total skor atau "-" |
| Aksi | Tombol "Detail" |

**Fitur:**

1. **Search**
   - Cari berdasarkan nama atau nomor absen

2. **Filter**
   - Filter berdasarkan kelas (dropdown)
   - Filter berdasarkan status (dropdown)

3. **Pagination**
   - 50 peserta per halaman
   - Navigasi page number

4. **Detail modal**
   - Informasi lengkap peserta
   - Progres setiap game
   - Waktu penyelesaian

#### Implementasi Tabel

```javascript
// src/components/ui/DataTable.jsx
export function DataTable({ columns, data, loading, pagination, onPageChange }) {
  if (loading) {
    return <TableSkeleton rows={10} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message="Tidak ada peserta yang sesuai" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          current={pagination.page}
          total={pagination.totalPages}
          onChange={onPageChange}
        />
      )}
    </div>
  );
}
```

#### Halaman Peserta

```javascript
// src/pages/admin/AdminParticipantsPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DataTable } from '@/components/ui/DataTable';
import { Search, Filter } from 'lucide-react';

export function AdminParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  const fetchParticipants = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('get-admin-participants', {
      body: {
        search,
        class: filterClass,
        status: filterStatus,
        page: pagination.page,
        limit: pagination.limit
      }
    });

    if (!error) {
      setParticipants(data.participants);
      setPagination(prev => ({ ...prev, total: data.pagination.total }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchParticipants();
  }, [search, filterClass, filterStatus, pagination.page]);

  const columns = [
    { key: 'display_name', label: 'Nama' },
    { key: 'class_name', label: 'Kelas' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
    },
    { key: 'scores.reflex', label: 'Reflex', render: (v, row) => row.scores?.reflex ?? '-' },
    { key: 'scores.memory', label: 'Memory', render: (v, row) => row.scores?.memory ?? '-' },
    { key: 'scores.quiz', label: 'Quiz', render: (v, row) => row.scores?.quiz ?? '-' },
    { key: 'total_score', label: 'Total', render: (v, row) => row.total_score ?? '-' },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_, row) => (
        <Button size="sm" variant="ghost" onClick={() => showDetail(row)}>
          Detail
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Cari nama atau nomor absen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />
        <Select value={filterClass} onChange={setFilterClass}>
          <option value="">Semua Kelas</option>
          <option value="IXA">IXA</option>
          <option value="IXB">IXB</option>
          {/* ... */}
        </Select>
        <Select value={filterStatus} onChange={setFilterStatus}>
          <option value="">Semua Status</option>
          <option value="registered">Belum Mulai</option>
          <option value="playing_reflex">Game 1</option>
          <option value="playing_memory">Game 2</option>
          <option value="playing_quiz">Game 3</option>
          <option value="completed">Selesai</option>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={participants}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        />
      </Card>

      {/* Detail Modal */}
      {selectedParticipant && (
        <ParticipantDetailModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  );
}
```

#### Checklist Fase 3

- [ ] Tabel peserta dengan data real
- [ ] Search berfungsi
- [ ] Filter kelas dan status berfungsi
- [ ] Pagination bekerja
- [ ] Modal detail peserta
- [ ] Loading skeleton
- [ ] Empty state
- [ ] Error handling

---

### Fase 4: Leaderboard Admin & Ekspor CSV (1 hari)

**Tujuan:** Tabel leaderboard dengan sorting tie-break dan ekspor data.

#### Leaderboard Admin

**Perbedaan dengan leaderboard publik:**
- Menampilkan skor per game
- Menampilkan rata-rata akurasi
- Menampilkan waktu penyelesaian
- Bisa ekspor ke CSV

**Kolom:**

| Kolom | Deskripsi |
|-------|-----------|
| Peringkat | Ranking dengan tie-break |
| Nama | Display name |
| Kelas | Kelas peserta |
| Reflex Rush | Skor game 1 |
| Memory Rush | Skor game 2 |
| Quiz Blitz | Skor game 3 |
| Total | Total skor |
| Akurasi | Rata-rata akurasi (%) |
| Waktu | Waktu penyelesaian |

**Sorting tie-break:**
1. Total skor DESC
2. Rata-rata akurasi DESC
3. completed_at ASC

#### Implementasi

```javascript
// src/pages/admin/AdminLeaderboardPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DataTable } from '@/components/ui/DataTable';
import { Download } from 'lucide-react';

export function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('get-admin-leaderboard');

    if (!error) {
      setLeaderboard(data.leaderboard);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleExportCSV = async () => {
    const { data, error } = await supabase.functions.invoke('export-csv');

    if (error) {
      alert('Gagal mengekspor data');
      return;
    }

    // Download CSV
    const blob = new Blob([data.csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scc-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'rank',
      label: 'Peringkat',
      render: (rank) => (
        <span className="flex items-center gap-2">
          {rank <= 3 && <Medal className={rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-amber-600'} />}
          {rank}
        </span>
      )
    },
    { key: 'display_name', label: 'Nama' },
    { key: 'class_name', label: 'Kelas' },
    { key: 'reflex_score', label: 'Reflex Rush' },
    { key: 'memory_score', label: 'Memory Rush' },
    { key: 'quiz_score', label: 'Quiz Blitz' },
    { key: 'total_score', label: 'Total' },
    { key: 'average_accuracy', label: 'Akurasi', render: (v) => `${v.toFixed(1)}%` },
    { key: 'completed_at', label: 'Waktu', render: (v) => formatDateTime(v) }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Leaderboard Kompetisi</h1>
        <Button icon={Download} onClick={handleExportCSV}>
          Ekspor CSV
        </Button>
      </div>

      <Card>
        <DataTable columns={columns} data={leaderboard} loading={loading} />
      </Card>
    </div>
  );
}
```

#### Format CSV

```csv
Peringkat,Nama,Kelas,Reflex Rush,Memory Rush,Quiz Blitz,Total,Akurasi (%),Waktu Penyelesaian
1,Ahmad_01_IXA,IXA,180,200,200,580,95.3,2026-10-18 10:30:00
2,Budi_02_IXA,IXA,175,200,200,575,94.8,2026-10-18 10:32:00
```

#### Checklist Fase 4

- [ ] Tabel leaderboard dengan data real
- [ ] Sorting sesuai tie-break
- [ ] Medal untuk top 3
- [ ] Tombol ekspor CSV
- [ ] Download CSV bekerja
- [ ] Auto-refresh (opsional)

---

### Fase 5: Pengaturan Kompetisi (0.5 hari)

**Tujuan:** Kontrol status kompetisi dan konfigurasi.

#### Status kompetisi

| Status | Deskripsi |
|--------|-----------|
| `draft` | Kompetisi belum dimulai |
| `open` | Pendaftaran dan permainan dibuka |
| `closed` | Kompetisi selesai |

#### Kontrol

1. **Status badge**
   - Menampilkan status saat ini dengan warna

2. **Tombol toggle**
   - "Buka Pendaftaran" → set `registration_open: true`
   - "Tutup Pendaftaran" → set `registration_open: false`

3. **Modal konfirmasi**
   - Sebelum menutup kompetisi, tampilkan modal:
     > "Menutup kompetisi akan menghentikan pendaftaran dan permainan baru. Peserta yang sedang bermain dapat menyelesaikan sesi mereka. Lanjutkan?"

4. **Audit log**
   - Setiap perubahan dicatat di `admin_activity`

#### Implementasi

```javascript
// src/pages/admin/AdminSettingsPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button, Badge, Modal, Card } from '@/components/ui';

export function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('competition_settings')
      .select('*')
      .single();

    if (!error) {
      setSettings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleRegistration = async () => {
    const newValue = !settings.registration_open;

    if (!newValue) {
      // Show confirmation modal
      setShowConfirmModal(true);
      return;
    }

    await updateSettings({ registration_open: true });
  };

  const handleCloseCompetition = async () => {
    await updateSettings({
      registration_open: false,
      status: 'closed'
    });
    setShowConfirmModal(false);
  };

  const updateSettings = async (updates) => {
    const { error } = await supabase.functions.invoke('update-competition-settings', {
      body: updates
    });

    if (error) {
      alert('Gagal memperbarui pengaturan');
      return;
    }

    fetchSettings();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1>Pengaturan Kompetisi</h1>

      {/* Status Card */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Status Kompetisi</h3>
            <p className="text-sm text-gray-500">Status saat ini kompetisi</p>
          </div>
          <Badge
            variant={settings.status === 'open' ? 'success' : settings.status === 'closed' ? 'danger' : 'neutral'}
            size="lg"
          >
            {settings.status.toUpperCase()}
          </Badge>
        </div>
      </Card>

      {/* Registration Card */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Pendaftaran</h3>
            <p className="text-sm text-gray-500">
              {settings.registration_open
                ? 'Peserta dapat mendaftar saat ini'
                : 'Pendaftaran ditutup'}
            </p>
          </div>
          <Button
            variant={settings.registration_open ? 'danger' : 'primary'}
            onClick={handleToggleRegistration}
          >
            {settings.registration_open ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-red-600">Tutup Kompetisi</h3>
            <p className="text-sm text-gray-500">
              Menghentikan semua aktivitas kompetisi secara permanen
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowConfirmModal(true)}
            disabled={settings.status === 'closed'}
          >
            Tutup Kompetisi
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Konfirmasi Penutupan"
      >
        <div className="space-y-4">
          <p>
            Menutup kompetisi akan menghentikan pendaftaran baru dan permainan baru.
            Peserta yang sedang bermain dapat menyelesaikan sesi mereka.
          </p>
          <p className="font-medium">Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleCloseCompetition}>
              Ya, Tutup Kompetisi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
```

#### Checklist Fase 5

- [ ] Status badge dengan warna sesuai status
- [ ] Toggle pendaftaran bekerja
- [ ] Modal konfirmasi untuk penutupan
- [ ] Update settings via backend
- [ ] Audit log tercatat
- [ ] Error handling

---

### Fase 6: Polish & UX Improvements (0.5 hari)

**Tujuan:** Memastikan UX konsisten dan error handling yang baik.

#### Toast notifications

```javascript
// src/components/ui/Toast.jsx
import { useEffect, useState } from 'react';

export function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50`}>
      {message}
    </div>
  );
}
```

#### Loading states

```javascript
// Skeleton untuk tabel
export function TableSkeleton({ rows = 10 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 py-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
```

#### Empty states

```javascript
export function EmptyState({ message, action }) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Search className="w-12 h-12 mx-auto" />
      </div>
      <p className="text-gray-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

#### Error boundaries

```javascript
// src/components/ErrorBoundary.jsx
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Terjadi kesalahan</h2>
            <Button onClick={() => window.location.reload()}>
              Muat Ulang Halaman
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Checklist Fase 6

- [ ] Toast notification untuk semua aksi
- [ ] Loading skeleton untuk tabel dan card
- [ ] Empty state untuk semua list
- [ ] Error boundary di level aplikasi
- [ ] Consistent error messages

---

## 7. Kontrak Integrasi dengan Backend

### Endpoint yang digunakan

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `get-admin-dashboard` | GET | - | `{ event, statistics, top_10, recent_activity }` |
| `get-admin-participants` | POST | `{ search, class, status, page, limit }` | `{ participants, pagination }` |
| `get-admin-leaderboard` | GET | - | `{ leaderboard }` |
| `export-csv` | GET | - | `{ csv: string }` |
| `update-competition-settings` | POST | `{ registration_open, status }` | `{ success }` |

### Supabase Auth

```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Logout
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Check admin status
const { data } = await supabase
  .from('admin_users')
  .select('*')
  .eq('id', user.id)
  .single();
```

---

## 8. Persyaratan UI/UX

### Layout

- Sidebar fixed di kiri (200px width)
- Content area mengisi sisa ruang
- Header dengan breadcrumb dan user info

### Responsiveness

- Target: desktop 1440×900
- Minimal: 1024×768
- Mobile: tidak dioptimalkan (admin operation)

### Accessibility

- [ ] Kontras teks minimal WCAG AA
- [ ] Keyboard navigation
- [ ] Focus ring yang jelas
- [ ] Label pada semua input
- [ ] Modal focus trap

---

## 9. Acceptance Criteria

### Fungsional

- [ ] Admin dapat login dengan email dan password
- [ ] Admin dapat melihat ringkasan di dashboard
- [ ] Admin dapat melihat, mencari, dan memfilter peserta
- [ ] Admin dapat melihat leaderboard dengan tie-break
- [ ] Admin dapat mengekspor data ke CSV
- [ ] Admin dapat membuka/menutup pendaftaran
- [ ] Admin dapat menutup kompetisi dengan konfirmasi

### Non-fungsional

- [ ] Halaman load dalam < 2 detik
- [ ] Tidak ada crash pada penggunaan normal
- [ ] Error message informatif
- [ ] Session persistence (refresh tidak logout)
- [ ] Route guard bekerja (redirect jika tidak login)

---

## 10. Definisi Selesai

- [ ] Semua halaman admin berfungsi penuh
- [ ] Terintegrasi dengan backend
- [ ] Testing manual di desktop
- [ ] Tidak ada bug kritis
- [ ] Code review selesai
- [ ] Merge ke main branch

---

## 11. Risiko dan Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Backend belum siap | Gunakan mock data untuk development |
| Auth tidak bekerja | Koordinasi intensif dengan Kiandra, test di staging |
| CSV export gagal | Handle error dengan retry dan pesan yang jelas |
| Admin salah tutup kompetisi | Modal konfirmasi, audit log |

---

## 12. Urutan Rekomendasi

1. **Fase 1** — Auth & route guard
2. **Fase 2** — Dashboard
3. **Fase 3** — Manajemen peserta
4. **Fase 4** — Leaderboard & ekspor CSV
5. **Fase 5** — Pengaturan kompetisi
6. **Fase 6** — Polish & UX

---

## 13. File yang Dibuat/Dimodifikasi

### Dimodifikasi

```
src/
├── pages/admin/
│   ├── AdminLoginPage.jsx         — Login dengan Supabase Auth
│   ├── AdminDashboardPage.jsx     — Dashboard dengan data real
│   ├── AdminParticipantsPage.jsx  — Tabel peserta dengan search/filter
│   ├── AdminLeaderboardPage.jsx   — Leaderboard dan ekspor CSV
│   └── AdminSettingsPage.jsx      — Pengaturan kompetisi
├── components/layout/
│   └── AdminLayout.jsx            — Layout dengan sidebar
└── app/router.jsx                 — Route guard
```

### Baru

```
src/
├── context/
│   └── AuthContext.jsx            — Auth state management
├── components/auth/
│   └── ProtectedRoute.jsx         — Route guard component
├── components/ui/
│   ├── DataTable.jsx              — Reusable table component
│   ├── Modal.jsx                  — Modal dialog
│   ├── Toast.jsx                  — Toast notification
│   ├── Skeleton.jsx               — Loading skeleton
│   ├── EmptyState.jsx             — Empty state component
│   └── Pagination.jsx             — Pagination component
└── hooks/
    └── useAdminData.js            — Hook untuk fetch admin data
```

---

## 14. Catatan Tambahan

- Koordinasi dengan Kiandra untuk backend API dan auth setup
- Test dengan akun admin yang sebenarnya
- Dokumentasikan semua bug dan solusi
- Backup sebelum melakukan perubahan besar
- Jangan commit credentials atau secret
