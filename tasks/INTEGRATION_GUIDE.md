# Integration Guide: SCC Game Arena

**Dokumen:** Panduan integrasi frontend-backend untuk tim development
**Versi:** 1.0
**Terakhir diperbarui:** 2026-10-18

---

## Daftar Isi

1. [Kontrak Backend API](#1-kontrak-backend-api)
2. [Ownership Matrix](#2-ownership-matrix)
3. [Enum Values & Constants](#3-enum-values--constants)
4. [Alur Peserta](#4-alur-peserta)
5. [Alur Admin](#5-alur-admin)
6. [File Ownership](#6-file-ownership)
7. [Prosedur Integrasi](#7-prosedur-integrasi)
8. [Environment Variables](#8-environment-variables)
9. [Testing Checklist](#9-testing-checklist)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Kontrak Backend API

### 1.1 Endpoint Peserta (Public)

#### `POST /functions/v1/register-participant`

**Deskripsi:** Mendaftarkan peserta baru ke kompetisi.

**Request:**
```json
{
  "full_name": "Ahmad Fauzi",
  "attendance_number": 1,
  "class_name": "IXA"
}
```

**Validasi:**
- `full_name`: 1-40 karakter, trim whitespace
- `attendance_number`: integer positif
- `class_name`: harus ada di daftar kelas yang valid

**Response 200:**
```json
{
  "success": true,
  "participant_id": "550e8400-e29b-41d4-a716-446655440000",
  "token": "secure_random_token_string",
  "display_name": "Ahmad_01_IXA"
}
```

**Response 400:**
```json
{
  "error": "Validasi gagal",
  "details": {
    "full_name": "Nama harus 1-40 karakter"
  }
}
```

**Response 409:**
```json
{
  "error": "Kombinasi kelas dan nomor absen sudah terdaftar"
}
```

**Response 503:**
```json
{
  "error": "Kompetisi tidak menerima pendaftaran"
}
```

---

#### `POST /functions/v1/get-progress`

**Deskripsi:** Mengambil progres peserta berdasarkan token sesi.

**Request:**
```json
{
  "token": "secure_random_token_string"
}
```

**Response 200:**
```json
{
  "participant_id": "550e8400-e29b-41d4-a716-446655440000",
  "display_name": "Ahmad_01_IXA",
  "status": "playing_memory",
  "games": {
    "reflex": {
      "completed": true,
      "score": 180,
      "accuracy": 90.0,
      "completed_at": "2026-10-18T10:30:00Z"
    },
    "memory": {
      "completed": false,
      "current_round": 3
    },
    "quiz": {
      "completed": false
    }
  }
}
```

**Response 401:**
```json
{
  "error": "Token tidak valid atau sudah expired"
}
```

---

#### `POST /functions/v1/start-game`

**Deskripsi:** Memulai sesi game dan mengambil challenge data.

**Request:**
```json
{
  "participant_token": "secure_random_token_string",
  "game_key": "reflex"
}
```

**Response 200 (Reflex/Memory):**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440001",
  "game_key": "reflex",
  "started_at": "2026-10-18T10:25:00Z"
}
```

**Response 200 (Quiz Blitz):**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440002",
  "game_key": "quiz",
  "questions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "question": "Apa ibukota Indonesia?",
      "options": ["Jakarta", "Bandung", "Surabaya", "Medan"]
    }
    // ... total 10 questions
  ]
}
```

**Catatan penting:**
- Quiz Blitz TIDAK mengirim `correct_option_index` ke client
- Jawaban dinilai di server setelah submit

---

#### `POST /functions/v1/submit-game-result`

**Deskripsi:** Mengirim hasil game untuk validasi dan penyimpanan.

**Request (Reflex Rush):**
```json
{
  "participant_token": "secure_random_token_string",
  "game_key": "reflex",
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440003",
  "metrics": {
    "targets_hit": 18,
    "targets_missed": 2,
    "traps_hit": 3,
    "duration_ms": 40123
  }
}
```

**Request (Memory Rush):**
```json
{
  "participant_token": "secure_random_token_string",
  "game_key": "memory",
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440004",
  "metrics": {
    "rounds_completed": 6,
    "rounds_correct": 6,
    "mistakes": 2,
    "duration_ms": 180500
  }
}
```

**Request (Quiz Blitz):**
```json
{
  "participant_token": "secure_random_token_string",
  "game_key": "quiz",
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440005",
  "answers": [
    {
      "question_id": "550e8400-e29b-41d4-a716-446655440010",
      "selected_index": 0,
      "response_time_ms": 5234
    }
    // ... total 10 answers
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "score": 180,
  "accuracy": 85.5,
  "completed_at": "2026-10-18T10:30:00Z"
}
```

**Response 409 (Duplicate):**
```json
{
  "error": "Hasil untuk game ini sudah tersimpan",
  "existing_result": {
    "score": 180,
    "completed_at": "2026-10-18T10:30:00Z"
  }
}
```

**Catatan idempotency:**
- `idempotency_key` harus unique per game per participant
- Jika request dengan key yang sama dikirim ulang, return hasil sebelumnya
- Ini mencegah hasil ganda dari retry

---

#### `GET /functions/v1/get-public-leaderboard`

**Deskripsi:** Mengambil leaderboard publik.

**Query Parameters:**
- `limit` (optional): jumlah peserta (default: 100)

**Response 200:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "display_name": "Ahmad_01_IXA",
      "class_name": "IXA",
      "total_score": 580,
      "average_accuracy": 95.3
    },
    {
      "rank": 2,
      "display_name": "Budi_02_IXA",
      "class_name": "IXA",
      "total_score": 575,
      "average_accuracy": 94.8
    }
  ],
  "updated_at": "2026-10-18T10:35:00Z"
}
```

**Catatan:**
- Hanya peserta dengan status `completed` yang muncul
- Harus punya 3 hasil game valid

---

### 1.2 Endpoint Admin (Protected)

Semua endpoint admin memerlukan header:
```
Authorization: Bearer <supabase_access_token>
```

#### `GET /functions/v1/get-admin-dashboard`

**Response 200:**
```json
{
  "event": {
    "name": "SCC Game Arena 2026",
    "status": "open"
  },
  "statistics": {
    "total_participants": 150,
    "completed": 45,
    "in_progress": 80,
    "not_started": 25,
    "average_score": 420.5
  },
  "top_10": [
    {
      "rank": 1,
      "display_name": "Ahmad_01_IXA",
      "total_score": 580
    }
  ],
  "recent_activity": [
    {
      "type": "registration",
      "display_name": "Cici_03_IXB",
      "timestamp": "2026-10-18T10:34:00Z"
    },
    {
      "type": "game_completed",
      "display_name": "Dedi_04_IXB",
      "game_key": "reflex",
      "score": 175,
      "timestamp": "2026-10-18T10:33:00Z"
    }
  ]
}
```

---

#### `POST /functions/v1/get-admin-participants`

**Request:**
```json
{
  "search": "ahmad",
  "class": "IXA",
  "status": "completed",
  "page": 1,
  "limit": 50
}
```

**Response 200:**
```json
{
  "participants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "display_name": "Ahmad_01_IXA",
      "full_name": "Ahmad Fauzi",
      "class_name": "IXA",
      "attendance_number": 1,
      "status": "completed",
      "scores": {
        "reflex": 180,
        "memory": 200,
        "quiz": 200
      },
      "total_score": 580,
      "average_accuracy": 95.3,
      "created_at": "2026-10-18T09:00:00Z",
      "completed_at": "2026-10-18T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "total_pages": 3
  }
}
```

---

#### `GET /functions/v1/get-admin-leaderboard`

**Response 200:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "display_name": "Ahmad_01_IXA",
      "class_name": "IXA",
      "reflex_score": 180,
      "memory_score": 200,
      "quiz_score": 200,
      "total_score": 580,
      "average_accuracy": 95.3,
      "completed_at": "2026-10-18T10:30:00Z"
    }
  ]
}
```

**Tie-break order:**
1. `total_score` DESC
2. `average_accuracy` DESC
3. `completed_at` ASC (timestamp server)

---

#### `GET /functions/v1/export-csv`

**Response 200:**
```json
{
  "csv": "Peringkat,Nama,Kelas,Reflex Rush,Memory Rush,Quiz Blitz,Total,Akurasi (%),Waktu\n1,Ahmad_01_IXA,IXA,180,200,200,580,95.3,2026-10-18 10:30:00\n..."
}
```

---

#### `POST /functions/v1/update-competition-settings`

**Request:**
```json
{
  "registration_open": false,
  "status": "closed"
}
```

**Response 200:**
```json
{
  "success": true,
  "settings": {
    "registration_open": false,
    "status": "closed",
    "updated_at": "2026-10-18T11:00:00Z",
    "updated_by": "admin_user_id"
  }
}
```

---

## 2. Ownership Matrix

| Komponen | Owner | Reviewer | Dependensi |
|----------|-------|----------|------------|
| **Backend & Database** | | | |
| Database schema & migration | Kiandra | - | - |
| RLS policies | Kiandra | - | Schema |
| Edge Functions | Kiandra | - | Schema, RLS |
| Quiz questions data | Kiandra | - | Schema |
| **Frontend - Participant Flow** | | | |
| Landing page | Rama | Kiandra | API dashboard stats |
| Registration page | Rama | Kiandra | API register-participant |
| Rules page | Rama | Kiandra | - |
| Reflex Rush gameplay | Rama | Kiandra | API start-game, submit-result |
| Memory Rush gameplay | Rama | Kiandra | API start-game, submit-result |
| Quiz Blitz gameplay | Rama | Kiandra | API start-game, submit-result |
| Result page | Rama | Kiandra | API get-progress |
| Leaderboard public | Rama | Kiandra | API get-public-leaderboard |
| **Frontend - Admin** | | | |
| Admin login | Rafa | Kiandra | Supabase Auth |
| Admin dashboard | Rafa | Kiandra | API get-admin-dashboard |
| Participants management | Rafa | Kiandra | API get-admin-participants |
| Leaderboard admin | Rafa | Kiandra | API get-admin-leaderboard |
| Settings | Rafa | Kiandra | API update-competition-settings |
| CSV export | Rafa | Kiandra | API export-csv |
| **Shared Components** | | | |
| AuthContext | Rafa | Kiandra, Rama | Supabase Auth |
| ProtectedRoute | Rafa | Kiandra | AuthContext |
| DataTable | Rafa | Rama | - |
| Modal | Rafa | Rama | - |
| Toast | Rafa | Rama | - |
| Timer | Rama | Rafa | - |
| Progress | Rama | Rafa | - |

---

## 3. Enum Values & Constants

### 3.1 Game Keys

```javascript
const GAME_KEYS = {
  REFLEX: 'reflex',
  MEMORY: 'memory',
  QUIZ: 'quiz'
};
```

**Penggunaan:** Identifikasi game di semua API request dan database.

---

### 3.2 Participant Status

```javascript
const PARTICIPANT_STATUS = {
  REGISTERED: 'registered',           // Belum mulai
  PLAYING_REFLEX: 'playing_reflex',   // Sedang bermain Reflex Rush
  PLAYING_MEMORY: 'playing_memory',   // Sedang bermain Memory Rush
  PLAYING_QUIZ: 'playing_quiz',       // Sedang bermain Quiz Blitz
  COMPLETED: 'completed',             // Selesai semua game
  DISQUALIFIED: 'disqualified'        // Didiskualifikasi
};
```

**Label UI:**
| Status | Label |
|--------|-------|
| `registered` | Belum Mulai |
| `playing_reflex` | Game 1 |
| `playing_memory` | Game 2 |
| `playing_quiz` | Game 3 |
| `completed` | Selesai |
| `disqualified` | Didiskualifikasi |

---

### 3.3 Event Status

```javascript
const EVENT_STATUS = {
  DRAFT: 'draft',     // Kompetisi belum dimulai
  OPEN: 'open',       // Pendaftaran dan permainan dibuka
  CLOSED: 'closed'    // Kompetisi selesai
};
```

**Warna badge:**
| Status | Warna |
|--------|-------|
| `draft` | neutral/gray |
| `open` | success/green |
| `closed` | danger/red |

---

### 3.4 Game Session Status

```javascript
const GAME_SESSION_STATUS = {
  STARTED: 'started',     // Game dimulai
  SUBMITTED: 'submitted', // Hasil dikirim, menunggu validasi
  VALIDATED: 'validated'  // Hasil divalidasi dan disimpan
};
```

---

### 3.5 Scoring Constants

```javascript
const SCORING = {
  // Reflex Rush
  REFLEX_TARGET_POINTS: 10,
  REFLEX_TRAP_PENALTY: 5,
  REFLEX_ROUNDS: 20,
  REFLEX_DURATION_SECONDS: 40,

  // Memory Rush
  MEMORY_ROUND_POINTS: 25,
  MEMORY_ROUNDS: 8,
  MEMORY_MAX_LIVES: 3,

  // Quiz Blitz
  QUIZ_CORRECT_POINTS: 20,
  QUIZ_QUESTIONS: 10,
  QUIZ_TIME_PER_QUESTION_SECONDS: 10,

  // General
  MAX_GAME_SCORE: 200,
  MAX_TOTAL_SCORE: 600
};
```

---

### 3.6 Daftar Kelas

```javascript
const VALID_CLASSES = [
  'IXA',
  'IXB',
  'IXC',
  'IXD',
  'IXE',
  'IXF'
  // Sesuaikan dengan data dari SMP
];
```

**Rentang nomor absen:** 1-40 (sesuaikan dengan data aktual)

---

## 4. Alur Peserta

### 4.1 Diagram Alur

```
┌─────────────────┐
│  Landing Page   │
│   (Buka /)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   Registrasi    │────▶│    Error:       │
│  (Isi form)     │     │ Duplikasi/Event │
└────────┬────────┘     │    tertutup     │
         │              └─────────────────┘
         │ Sukses
         ▼
┌─────────────────┐
│  Simpan token   │
│ ke localStorage │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Aturan Page    │
│   (Baca info)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Reflex Rush    │
│   (Main 40s)    │
└────────┬────────┘
         │ Submit hasil
         ▼
┌─────────────────┐
│  Memory Rush    │
│  (Main 8 ronde) │
└────────┬────────┘
         │ Submit hasil
         ▼
┌─────────────────┐
│  Quiz Blitz     │
│  (10 soal)      │
└────────┬────────┘
         │ Submit hasil
         ▼
┌─────────────────┐
│  Result Page    │
│ (Skor total)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Leaderboard    │
│    Publik       │
└─────────────────┘
```

---

### 4.2 State Management

**Token storage:**
```javascript
// Setelah registrasi berhasil
localStorage.setItem('participant_token', data.token);
localStorage.setItem('participant_id', data.participant_id);
localStorage.setItem('display_name', data.display_name);
```

**Cek sesi saat load:**
```javascript
useEffect(() => {
  const token = localStorage.getItem('participant_token');
  if (!token) {
    // Redirect ke registrasi
    navigate('/register');
    return;
  }

  // Fetch progress dari backend
  fetchProgress(token);
}, []);
```

**Refresh halaman:**
- Cek token di localStorage
- Panggil `get-progress` untuk mendapatkan status terbaru
- Redirect ke halaman yang sesuai berdasarkan status

---

### 4.3 Error Handling

| Error | Response | Action |
|-------|----------|--------|
| Token invalid | 401 | Hapus localStorage, redirect ke `/register` |
| Event closed | 503 | Tampilkan pesan, redirect ke landing |
| Submit gagal | 500 | Tampilkan tombol retry, simpan data lokal |
| Duplikasi | 409 | Tawarkan lanjutkan sesi atau hubungi panitia |

---

## 5. Alur Admin

### 5.1 Diagram Alur

```
┌─────────────────┐
│  Admin Login    │
│ (Email + Pass)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Supabase Auth  │────▶│    Error:       │
│   Validate      │     │  Unauthorized   │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Cek admin_users │
│   table         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Dashboard    │
│  (Statistics)   │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│   Participants  │   │   Leaderboard   │
│   Management    │   │     Admin       │
└─────────────────┘   └────────┬────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │   Export CSV    │
                      └─────────────────┘

         │
         ▼
┌─────────────────┐
│    Settings     │
│  (Open/Close)   │
└─────────────────┘
```

---

### 5.2 Auth Flow

**Login:**
```javascript
const handleLogin = async (email, password) => {
  // 1. Login via Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // 2. Cek apakah user adalah admin
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!adminData) {
    await supabase.auth.signOut();
    throw new Error('Bukan admin');
  }

  // 3. Redirect ke dashboard
  navigate('/admin');
};
```

**Session persistence:**
```javascript
// Supabase Auth otomatis menyimpan session
// Cek di useEffect
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

### 5.3 Route Guard

```javascript
// ProtectedRoute.jsx
function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user || !isAdmin) return <Navigate to="/admin/login" />;

  return children;
}
```

---

## 6. File Ownership

### 6.1 Backend Files (Kiandra)

```
supabase/
├── migrations/
│   ├── 001_create_events.sql
│   ├── 002_create_participants.sql
│   ├── 003_create_game_sessions.sql
│   ├── 004_create_game_results.sql
│   ├── 005_create_quiz_questions.sql
│   ├── 006_create_admin_users.sql
│   ├── 007_create_competition_settings.sql
│   ├── 008_create_admin_activity.sql
│   ├── 009_create_indexes.sql
│   ├── 010_create_views.sql
│   └── 011_enable_rls.sql
├── functions/
│   ├── register-participant/
│   ├── get-progress/
│   ├── start-game/
│   ├── submit-game-result/
│   ├── get-public-leaderboard/
│   ├── get-admin-dashboard/
│   ├── get-admin-participants/
│   ├── get-admin-leaderboard/
│   ├── export-csv/
│   └── update-competition-settings/
└── seed/
    ├── quiz_questions.sql
    └── admin_users.sql
```

---

### 6.2 Frontend Files - Participant Flow (Rama)

```
src/
├── pages/public/
│   ├── LandingPage.jsx
│   ├── RegisterPage.jsx
│   ├── RulesPage.jsx
│   ├── ReflexRushPage.jsx
│   ├── MemoryRushPage.jsx
│   ├── QuizBlitzPage.jsx
│   ├── ResultPage.jsx
│   └── LeaderboardPage.jsx
├── components/game/
│   ├── GameShell.jsx
│   ├── GameTimer.jsx
│   └── ScoreDisplay.jsx
├── hooks/
│   ├── useGameSession.js
│   ├── useCountdown.js
│   └── useLeaderboard.js
└── utils/
    └── gameLogic.js
```

---

### 6.3 Frontend Files - Admin (Rafa)

```
src/
├── pages/admin/
│   ├── AdminLoginPage.jsx
│   ├── AdminDashboardPage.jsx
│   ├── AdminParticipantsPage.jsx
│   ├── AdminLeaderboardPage.jsx
│   └── AdminSettingsPage.jsx
├── components/layout/
│   ├── AdminLayout.jsx
│   ├── AdminSidebar.jsx
│   └── AdminHeader.jsx
├── components/auth/
│   └── ProtectedRoute.jsx
├── components/ui/
│   ├── DataTable.jsx
│   ├── Modal.jsx
│   ├── Toast.jsx
│   ├── Skeleton.jsx
│   ├── EmptyState.jsx
│   └── Pagination.jsx
├── context/
│   └── AuthContext.jsx
└── hooks/
    └── useAdminData.js
```

---

### 6.4 Shared Files (Koordinasi)

```
src/
├── lib/
│   ├── supabase.js        — Kiandra setup, Rama & Rafa pakai
│   └── env.js             — Kiandra setup
├── app/
│   └── router.jsx         — Rafa setup route guard, Rama public routes
└── components/ui/
    ├── Button.jsx         — Sudah ada
    ├── Input.jsx          — Sudah ada
    ├── Card.jsx           — Sudah ada
    ├── Badge.jsx          — Sudah ada
    ├── Progress.jsx       — Sudah ada
    └── Timer.jsx          — Sudah ada
```

---

## 7. Prosedur Integrasi

### 7.1 Fase Persiapan

**Kiandra:**
1. Setup Supabase project
2. Jalankan migration
3. Buat akun admin di Supabase Auth
4. Seed data quiz questions
5. Share `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`

**Rama & Rafa:**
1. Update `.env` dengan credentials dari Kiandra
2. Test koneksi Supabase client
3. Verifikasi bisa fetch data dari tabel public

---

### 7.2 Fase Development

**Week 1:**
- Kiandra: Database schema, RLS, Auth setup
- Rama: Landing, Registration, Rules (frontend)
- Rafa: Admin login, route guard, AuthContext

**Week 2:**
- Kiandra: All Edge Functions
- Rama: Gameplay 3 games, Result page
- Rafa: Admin dashboard, Participants page

**Week 3:**
- Kiandra: Admin API, monitoring
- Rama: Leaderboard public, error handling
- Rafa: Leaderboard admin, CSV export, Settings

**Week 4:**
- Integration testing
- Bug fixes
- Performance optimization

---

### 7.3 Fase Testing

**Unit testing (masing-masing):**
- Kiandra: Test semua Edge Functions
- Rama: Test komponen game
- Rafa: Test komponen admin

**Integration testing (bersama):**
1. Test alur registrasi → 3 games → result
2. Test alur admin login → dashboard → export
3. Test refresh halaman mempertahankan state
4. Test error handling (offline, server error)
5. Test duplicate prevention
6. Test tie-break leaderboard

**Load testing (Kiandra lead):**
1. 10 concurrent users
2. 32 concurrent users
3. 64 concurrent users
4. 96 concurrent users

---

### 7.4 Fase Deployment

**Pre-deployment:**
1. Code review semua PR
2. Merge ke main branch
3. Build production (`npm run build`)
4. Test build lokal

**Deployment:**
1. Kiandra: Migration ke production Supabase
2. Rama & Rafa: Deploy frontend ke Vercel
3. Smoke test di production
4. Setup monitoring

**Post-deployment:**
1. Buat akun admin production
2. Seed quiz questions production
3. Test end-to-end di production
4. Simulasi dengan peserta nyata

---

### 7.5 Komunikasi

**Daily standup:**
- Progress update
- Blocker
- Next steps

**Shared documents:**
- API documentation (dokumen ini)
- Database schema (README atau wiki)
- Deployment checklist

**Branching strategy:**
- `main` — Production ready
- `develop` — Integration branch
- `feature/*` — Feature branches
- `bugfix/*` — Bug fix branches

---

## 8. Environment Variables

### 8.1 Frontend (.env)

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...

# App (optional)
VITE_APP_NAME=SCC Game Arena
VITE_APP_VERSION=1.0.0
```

### 8.2 Supabase (Edge Functions)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJ...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...  # Jangan expose ke frontend!
```

### 8.3 Vercel (Deployment)

Set di Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 9. Testing Checklist

### 9.1 Participant Flow

- [ ] Registrasi berhasil dengan data valid
- [ ] Registrasi gagal dengan data invalid
- [ ] Registrasi gagal jika duplikat
- [ ] Token disimpan di localStorage
- [ ] Progres dapat dilanjutkan setelah refresh
- [ ] Reflex Rush gameplay bekerja
- [ ] Memory Rush gameplay bekerja
- [ ] Quiz Blitz gameplay bekerja
- [ ] Hasil game tersimpan di backend
- [ ] Retry tidak menggandakan hasil
- [ ] Result page menampilkan skor benar
- [ ] Leaderboard menampilkan peserta selesai

### 9.2 Admin Flow

- [ ] Login berhasil dengan kredensial benar
- [ ] Login gagal dengan kredensial salah
- [ ] Non-admin tidak bisa akses dashboard
- [ ] Dashboard menampilkan statistik real
- [ ] Search peserta bekerja
- [ ] Filter peserta bekerja
- [ ] Pagination bekerja
- [ ] Leaderboard admin dengan tie-break benar
- [ ] Export CSV berhasil download
- [ ] Toggle pendaftaran bekerja
- [ ] Tutup kompetisi dengan konfirmasi
- [ ] Logout berhasil

### 9.3 Security

- [ ] RLS aktif di semua tabel
- [ ] Anon key tidak bisa akses data sensitif
- [ ] Service role key tidak expose di frontend
- [ ] Token peserta tidak visible di UI
- [ ] Jawaban quiz tidak bocor ke client
- [ ] Admin endpoint memerlukan auth

### 9.4 Performance

- [ ] Landing page load < 3 detik
- [ ] Game berjalan 60fps
- [ ] API response p95 < 1500ms
- [ ] Tidak ada memory leak
- [ ] Load test 96 users passed

---

## 10. Troubleshooting

### 10.1 Koneksi Supabase Gagal

**Symptom:** `Failed to fetch` atau network error

**Check:**
1. `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah benar?
2. Supabase project aktif? (cek dashboard)
3. CORS configured? (Supabase default should work)
4. Network/firewall blocking?

**Solution:**
```javascript
// Test koneksi
const { data, error } = await supabase.from('events').select('*').limit(1);
console.log(data, error);
```

---

### 10.2 Auth Tidak Bekerja

**Symptom:** Login berhasil tapi tidak bisa akses admin page

**Check:**
1. User ada di tabel `admin_users`?
2. RLS policy untuk `admin_users` benar?
3. Session disimpan dengan benar?

**Debug:**
```javascript
// Cek user
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Cek admin status
const { data, error } = await supabase
  .from('admin_users')
  .select('*')
  .eq('id', user.id)
  .single();
console.log('Admin:', data, error);
```

---

### 10.3 RLS Memblokir Query

**Symptom:** `new row violates row-level security policy`

**Check:**
1. Policy sudah dibuat untuk tabel tersebut?
2. Policy mengizinkan operasi yang dilakukan?
3. User terautentikasi dengan benar?

**Debug:**
```sql
-- Cek policy
SELECT * FROM pg_policies WHERE tablename = 'participants';

-- Test query sebagai anon
SET ROLE anon;
SELECT * FROM participants;

-- Test query sebagai authenticated user
SET ROLE authenticated;
SELECT * FROM participants;
```

---

### 10.4 Hasil Game Tidak Tersimpan

**Symptom:** Submit game berhasil tapi data tidak muncul di database

**Check:**
1. Edge Function mengembalikan success?
2. Idempotency key berbeda untuk setiap submit?
3. Constraint unik tidak terlanggar?

**Debug:**
```javascript
// Log response
const { data, error } = await supabase.functions.invoke('submit-game-result', {
  body: { ... }
});
console.log('Response:', data, error);

// Cek database
const { data: results } = await supabase
  .from('game_results')
  .select('*')
  .eq('participant_id', participantId);
console.log('Results:', results);
```

---

### 10.5 Leaderboard Tidak Update

**Symptom:** Peserta selesai tapi tidak muncul di leaderboard

**Check:**
1. Participant status = `completed`?
2. Ada 3 hasil game untuk participant tersebut?
3. View leaderboard query benar?

**Debug:**
```sql
-- Cek participant status
SELECT id, status FROM participants WHERE id = 'participant_id';

-- Cek game results
SELECT * FROM game_results WHERE participant_id = 'participant_id';

-- Cek view
SELECT * FROM public_leaderboard LIMIT 10;
```

---

### 10.6 CSV Export Gagal

**Symptom:** Download tidak dimulai atau file kosong

**Check:**
1. Endpoint mengembalikan data?
2. Blob creation benar?
3. Browser blocking download?

**Debug:**
```javascript
const { data, error } = await supabase.functions.invoke('export-csv');
console.log('CSV data:', data, error);

// Manual download test
const blob = new Blob([data.csv], { type: 'text/csv' });
console.log('Blob size:', blob.size);
```

---

## Lampiran

### A. Database Schema Summary

| Tabel | Deskripsi | RLS |
|-------|-----------|-----|
| `events` | Informasi kompetisi | Yes |
| `participants` | Data peserta | Yes |
| `game_sessions` | Sesi game | Yes |
| `game_results` | Hasil game | Yes |
| `quiz_questions` | Bank soal | Yes |
| `admin_users` | Role admin | Yes |
| `competition_settings` | Konfigurasi | Yes |
| `admin_activity` | Audit log | Yes |

### B. API Summary

| Endpoint | Method | Auth | Deskripsi |
|----------|--------|------|-----------|
| `register-participant` | POST | Public | Daftar peserta |
| `get-progress` | POST | Token | Ambil progres |
| `start-game` | POST | Token | Mulai game |
| `submit-game-result` | POST | Token | Submit hasil |
| `get-public-leaderboard` | GET | Public | Leaderboard |
| `get-admin-dashboard` | GET | Admin | Dashboard |
| `get-admin-participants` | POST | Admin | List peserta |
| `get-admin-leaderboard` | GET | Admin | Leaderboard detail |
| `export-csv` | GET | Admin | Export CSV |
| `update-competition-settings` | POST | Admin | Update settings |

### C. Contact

- **Backend (Kiandra):** [contact]
- **Frontend Participant (Rama):** [contact]
- **Frontend Admin (Rafa):** [contact]

---

**Dokumen ini akan diperbarui seiring dengan perubahan requirement dan feedback dari tim.**
