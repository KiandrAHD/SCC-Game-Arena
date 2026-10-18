# SCC Game Arena

Website kompetisi mini-game untuk kegiatan Stematel Creative Challenge (SCC) 2026 SMK Telkom Purwokerto di SMP Negeri 1 Karangpucung.

## Deskripsi

SCC Game Arena adalah website kompetisi yang terdiri dari tiga mini-game:

1. **Reflex Rush** — Menguji kecepatan refleks
2. **Memory Rush** — Menguji ingatan terhadap pola warna
3. **Quiz Blitz** — Menguji pengetahuan umum

Peserta memainkan ketiga game secara berurutan. Setiap game memiliki skor maksimal 200 poin, sehingga total maksimal adalah 600 poin.

## Teknologi

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Ikon:** Lucide React
- **Backend & Database:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Hosting:** Vercel

## Instalasi

### Prasyarat

- Node.js 18 atau lebih baru
- npm atau yarn
- Akun Supabase

### Langkah Instalasi

1. Clone repository:
   ```bash
   git clone https://github.com/KiandrAHD/SCC-Game-Arena.git
   cd SCC-Game-Arena
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Salin file environment:
   ```bash
   cp .env.example .env
   ```

4. Isi environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Jalankan development server:
   ```bash
   npm run dev
   ```

6. Buka `http://localhost:5173` di browser.

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build untuk produksi |
| `npm run preview` | Preview build produksi |
| `npm run lint` | Menjalankan ESLint |

## Struktur Direktori

```
src/
├── app/                    # Routing dan provider
│   ├── App.jsx
│   └── router.jsx
├── components/
│   ├── ui/                 # Komponen UI dasar
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Progress.jsx
│   │   └── Timer.jsx
│   ├── layout/             # Layout wrapper
│   │   ├── PublicLayout.jsx
│   │   └── AdminLayout.jsx
│   └── game/               # Komponen game
│       ├── GameShell.jsx
│       ├── GameProgress.jsx
│       └── ScoreDisplay.jsx
├── pages/
│   ├── public/             # Halaman peserta
│   │   ├── LandingPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── RulesPage.jsx
│   │   ├── ReflexRushPage.jsx
│   │   ├── MemoryRushPage.jsx
│   │   ├── QuizBlitzPage.jsx
│   │   ├── ResultPage.jsx
│   │   └── LeaderboardPage.jsx
│   └── admin/              # Halaman admin
│       ├── AdminLoginPage.jsx
│       ├── AdminDashboardPage.jsx
│       ├── AdminParticipantsPage.jsx
│       ├── AdminResultsPage.jsx
│       └── AdminSettingsPage.jsx
├── lib/
│   ├── supabase.js         # Supabase client
│   └── env.js              # Environment config
├── styles/
│   └── index.css           # Global styles + Tailwind
└── main.jsx                # Entry point

supabase/
├── migrations/             # Database migrations
└── functions/              # Edge Functions

public/
└── favicon.svg

.env.example
.gitignore
package.json
tailwind.config.js
vite.config.js
README.md
```

## Menghubungkan Supabase

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Pilih region terdekat (misalnya Singapore).
3. Salin **Project URL** dan **anon public key** dari Settings > API.
4. Paste ke file `.env`:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
   ```

### Setup Database

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login ke Supabase:
   ```bash
   supabase login
   ```

3. Link project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Jalankan migrations (jika ada):
   ```bash
   supabase db push
   ```

## Deployment ke Vercel

1. Push kode ke GitHub.

2. Import project di [Vercel Dashboard](https://vercel.com).

3. Tambahkan environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Deploy.

Vercel akan otomatis mendeploy setiap ada push ke branch `main`.

## Status Fitur

### Sudah Diimplementasi
- [x] Struktur folder aplikasi
- [x] Routing untuk semua halaman
- [x] Layout publik dan admin
- [x] Komponen UI dasar (Button, Input, Card, Badge, Progress, Timer)
- [x] Halaman landing, registrasi, aturan
- [x] Halaman placeholder untuk ketiga game
- [x] Halaman hasil dan leaderboard
- [x] Halaman admin (login, dashboard, peserta, hasil, pengaturan)
- [x] Integrasi Supabase client
- [x] Environment variables
- [x] Styling dasar dengan Tailwind CSS

### Placeholder / Belum Diimplementasi
- [ ] Gameplay Reflex Rush
- [ ] Gameplay Memory Rush
- [ ] Gameplay Quiz Blitz
- [ ] Registrasi dengan backend Supabase
- [ ] Penyimpanan hasil ke database
- [ ] Autentikasi admin dengan Supabase Auth
- [ ] Leaderboard real-time
- [ ] Ekspor CSV
- [ ] Validasi skor di server
- [ ] Load testing

## Keamanan

- Jangan pernah menaruh `service_role` key di frontend atau repository.
- Gunakan environment variables untuk kredensial.
- Aktifkan Row Level Security (RLS) di Supabase.
- File `.env` tidak ikut ter-commit ke Git.

## Pengembangan Lanjutan
`MASIH TAHAP PERKEMBANGAN`

Dokumen lengkap spesifikasi produk dan desain tersedia di:
- `PRD_SCC_Game_Area.md` — Product Requirements Document
- `SCC_GAME_ARENA_DESIGN.md` — UI/UX Design Specification

## Lisensi

Proyek ini dibuat untuk kegiatan SCC SMK Telkom Purwokerto 2026.
