# Task Document: Backend & Database Implementation

**Ditujukan untuk:** Kiandra (Backend Engineer)
**Prioritas:** Tinggi
**Estimasi:** 5-7 hari kerja

---

## 1. Tujuan

Mengimplementasikan seluruh backend, database, dan operasi server-side untuk SCC Game Arena menggunakan Supabase (PostgreSQL, Auth, Edge Functions). Backend harus menangani registrasi peserta, validasi game, penyimpanan hasil, leaderboard, autentikasi admin, dan operasi admin dengan keamanan dan integritas data yang terjaga.

---

## 2. Konteks

- **Stack:** Supabase (PostgreSQL, Auth, Edge Functions), React frontend
- **Target:** Hingga 96 pengguna aktif bersamaan, 300 peserta terdaftar
- **Kebutuhan utama:** Validasi server-side, idempotency, RLS, anti-cheat dasar

Repository frontend sudah memiliki:
- React 18.3.1, Vite 5.4.10, Tailwind CSS 3.4.14
- Supabase client di `src/lib/supabase.js` (belum terkonfigurasi)
- Semua halaman placeholder, termasuk gameplay
- Routing lengkap di `src/app/router.jsx`

---

## 3. Ruang Lingkup

### Termasuk

1. **Skema database** — tabel, constraint, indeks, view
2. **Row Level Security (RLS)** — kebijakan akses untuk setiap tabel
3. **Autentikasi admin** — Supabase Auth + tabel admin_users
4. **Registrasi peserta** — validasi, token sesi, pencegahan duplikasi
5. **Game submission** — validasi skor, idempotency, atomic operation
6. **Leaderboard** — kalkulasi, tie-break, view/materialized view
7. **Admin operations** — dashboard, manajemen peserta, ekspor CSV, pengaturan
8. **Testing** — unit test, integration test, load test
9. **Deployment** — migration, seed data, monitoring

### Tidak Termasuk

- Frontend implementation (tanggung jawab Rama & Rafa)
- Animasi dan UI components
- Load testing infrastructure setup (gunakan tool eksternal seperti k6 atau Artillery)

---

## 4. Kondisi Repository Saat Ini

| Area | Status | Keterangan |
|------|--------|------------|
| Supabase client | ❌ Belum terkonfigurasi | `src/lib/supabase.js` perlu env variables |
| Database schema | ❌ Tidak ada | Perlu migration dari nol |
| RLS policies | ❌ Tidak ada | Semua tabel perlu RLS |
| Auth admin | ❌ Tidak ada | Perlu setup Supabase Auth + admin_users |
| API endpoints | ❌ Tidak ada | Perlu Edge Functions atau RPC |
| Game validation | ❌ Tidak ada | Semua validasi di frontend (tidak aman) |

---

## 5. Prasyarat

- [ ] Akses ke Supabase project (region: Singapore atau terdekat)
- [ ] `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari project settings
- [ ] Service role key (untuk admin operations, **jangan expose ke frontend**)
- [ ] Daftar kelas dan rentang nomor absen dari panitia
- [ ] Daftar akun admin yang diizinkan
- [ ] Daftar soal Quiz Blitz (10-20 soal cadangan)

---

## 6. Fase Implementasi

### Fase 1: Database Schema & Migration (1-2 hari)

**Tujuan:** Membuat struktur database yang solid dengan constraint dan indeks yang tepat.

#### Tabel utama

```sql
-- 1. events
create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- 2. participants
create table participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id),
  full_name text not null,
  display_name text not null,
  attendance_number integer not null,
  class_name text not null,
  entry_token_hash text not null unique,
  status text not null default 'registered' check (status in ('registered', 'playing_reflex', 'playing_memory', 'playing_quiz', 'completed', 'disqualified')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (event_id, class_name, attendance_number)
);

-- 3. game_sessions
create table game_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id),
  game_key text not null check (game_key in ('reflex', 'memory', 'quiz')),
  status text not null default 'started' check (status in ('started', 'submitted', 'validated')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  challenge_metadata jsonb not null default '{}',
  idempotency_key text unique,
  unique (participant_id, game_key)
);

-- 4. game_results
create table game_results (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id),
  game_key text not null check (game_key in ('reflex', 'memory', 'quiz')),
  score integer not null check (score between 0 and 200),
  accuracy numeric(5,2) not null default 0 check (accuracy between 0 and 100),
  duration_ms integer not null,
  metrics jsonb not null default '{}',
  completed_at timestamptz not null default now(),
  idempotency_key text unique,
  unique (participant_id, game_key)
);

-- 5. quiz_questions
create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  question text not null,
  options jsonb not null,
  correct_option_index integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. admin_users
create table admin_users (
  id uuid primary key references auth.users(id),
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);

-- 7. competition_settings (singleton)
create table competition_settings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id),
  registration_open boolean not null default false,
  replay_allowed boolean not null default false,
  reflex_duration_seconds integer not null default 40,
  reflex_rounds integer not null default 20,
  memory_rounds integer not null default 8,
  memory_max_lives integer not null default 3,
  quiz_questions_count integer not null default 10,
  quiz_time_per_question_seconds integer not null default 10,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- 8. admin_activity (audit log)
create table admin_activity (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id),
  action text not null,
  target_type text,
  target_id uuid,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

#### Indeks

```sql
create index idx_participants_event on participants(event_id);
create index idx_participants_status on participants(status);
create index idx_participants_class on participants(class_name);
create index idx_game_sessions_participant on game_sessions(participant_id);
create index idx_game_results_participant on game_results(participant_id);
create index idx_game_results_completed on game_results(completed_at desc);
create index idx_quiz_questions_active on quiz_questions(event_id, is_active);
create index idx_admin_activity_admin on admin_activity(admin_id);
create index idx_admin_activity_created on admin_activity(created_at desc);
```

#### View leaderboard

```sql
create view public_leaderboard as
select
  p.id,
  p.display_name,
  p.class_name,
  coalesce(sum(gr.score), 0) as total_score,
  coalesce(avg(gr.accuracy), 0) as average_accuracy,
  p.completed_at
from participants p
left join game_results gr on gr.participant_id = p.id
where p.status = 'completed'
group by p.id, p.display_name, p.class_name, p.completed_at
having count(distinct gr.game_key) = 3;
```

#### Checklist Fase 1

- [ ] Buat migration file untuk setiap tabel
- [ ] Jalankan migration di staging
- [ ] Verifikasi constraint dan indeks
- [ ] Test insert/update/delete dasar
- [ ] Dokumentasikan skema di README atau wiki

---

### Fase 2: Row Level Security (RLS) (0.5-1 hari)

**Tujuan:** Memastikan tidak ada kebocoran data dan akses tidak sah.

#### Kebijakan RLS

```sql
-- Enable RLS
alter table events enable row level security;
alter table participants enable row level security;
alter table game_sessions enable row level security;
alter table game_results enable row level security;
alter table quiz_questions enable row level security;
alter table admin_users enable row level security;
alter table competition_settings enable row level security;
alter table admin_activity enable row level security;

-- Events: publik bisa lihat event yang open
create policy "Events are viewable by everyone"
  on events for select
  using (status = 'open' or exists (select 1 from admin_users where id = auth.uid()));

-- Participants: peserta hanya bisa lihat/ubah data sendiri via token
-- Note: Untuk MVP, gunakan service function dengan token validation
create policy "Participants can view own data"
  on participants for select
  using (auth.uid() is not null); -- Will be refined with token validation

-- Game results: hanya peserta terkait yang bisa submit
-- Note: Use Edge Function for submission, not direct insert

-- Quiz questions: jawaban benar HIDDEN dari publik
create policy "Quiz questions viewable without correct answer"
  on quiz_questions for select
  using (is_active = true);

-- Admin tables: hanya admin
create policy "Admin only access"
  on admin_users for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admin activity log"
  on admin_activity for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admin settings access"
  on competition_settings for all
  using (exists (select 1 from admin_users where id = auth.uid()));
```

#### Checklist Fase 2

- [ ] Enable RLS di semua tabel
- [ ] Buat policy untuk setiap use case
- [ ] Test dengan anon key (harus gagal untuk data sensitif)
- [ ] Test dengan admin auth (harus berhasil)
- [ ] Verifikasi jawaban quiz tidak bocor ke client

---

### Fase 3: Autentikasi Admin (0.5 hari)

**Tujuan:** Setup login admin dengan Supabase Auth.

#### Langkah

1. Enable email/password auth di Supabase
2. Buat akun admin via Supabase dashboard atau SQL
3. Insert ke `admin_users` table
4. Setup trigger untuk auto-insert ke `admin_users` setelah user dibuat (opsional)

```sql
-- Trigger untuk auto-populate admin_users
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into admin_users (id, role)
  values (new.id, 'admin');
  return new;
end;
$$ language plpgsql security definer;

-- Note: Only attach this trigger for admin user creation, not all users
```

#### Checklist Fase 3

- [ ] Supabase Auth enabled
- [ ] Minimal 2 akun admin dibuat
- [ ] Admin dapat login via frontend
- [ ] Session management bekerja
- [ ] Logout bekerja

---

### Fase 4: Registrasi Peserta & Token Sesi (1 hari)

**Tujuan:** Implementasi registrasi dengan validasi backend dan token sesi yang aman.

#### API Endpoint: `register-participant`

**Input:**
```json
{
  "full_name": "Ahmad Fauzi",
  "attendance_number": 1,
  "class_name": "IXA"
}
```

**Validasi:**
- Event status harus `open`
- `full_name`: 1-40 karakter, trim whitespace
- `attendance_number`: integer dalam rentang yang valid
- `class_name`: harus ada di daftar kelas
- Kombinasi `(event_id, class_name, attendance_number)` harus unik

**Proses:**
1. Generate token sesi dengan entropy yang cukup (crypto.randomBytes)
2. Hash token dengan bcrypt/argon2
3. Simpan `entry_token_hash` ke database
4. Return token asli ke client (hanya sekali)

**Response sukses:**
```json
{
  "success": true,
  "participant_id": "uuid",
  "token": "random_token_string",
  "display_name": "Ahmad_01_IXA"
}
```

**Response error:**
- `400` — Validasi gagal
- `409` — Kombinasi sudah terdaftar
- `503` — Kompetisi tidak menerima pendaftaran

#### API Endpoint: `get-progress`

**Input:** Token dari localStorage/sessionStorage

**Validasi:**
- Hash token dan cocokkan dengan database
- Return status dan progres peserta

**Response:**
```json
{
  "participant_id": "uuid",
  "display_name": "Ahmad_01_IXA",
  "status": "playing_memory",
  "games": {
    "reflex": { "completed": true, "score": 180 },
    "memory": { "completed": false, "current_round": 3 },
    "quiz": { "completed": false }
  }
}
```

#### Checklist Fase 4

- [ ] Edge Function `register-participant` berjalan
- [ ] Validasi input ketat
- [ ] Token generation aman (crypto)
- [ ] Pencegahan duplikasi di database level
- [ ] Endpoint `get-progress` bekerja
- [ ] Test: refresh halaman mengembalikan progres

---

### Fase 5: Game Submission & Validation (1.5-2 hari)

**Tujuan:** Menerima hasil game dengan validasi ketat dan idempotency.

#### API Endpoint: `start-game`

**Input:**
```json
{
  "participant_token": "token_string",
  "game_key": "reflex"
}
```

**Proses:**
1. Validasi token dan status peserta
2. Buat `game_sessions` record
3. Generate challenge metadata (untuk quiz: pilih soal random)
4. Return challenge data

**Response untuk Quiz Blitz:**
```json
{
  "session_id": "uuid",
  "questions": [
    { "id": "uuid", "question": "Apa ibukota Indonesia?", "options": ["Jakarta", "Bandung", "Surabaya", "Medan"] }
    // ... tanpa correct_option_index
  ]
}
```

#### API Endpoint: `submit-game-result`

**Input untuk Reflex Rush:**
```json
{
  "participant_token": "token_string",
  "game_key": "reflex",
  "idempotency_key": "client-generated-uuid",
  "metrics": {
    "targets_hit": 18,
    "targets_missed": 2,
    "traps_hit": 3,
    "duration_ms": 40123
  }
}
```

**Validasi Reflex:**
- Durasi <= max duration + tolerance
- `targets_hit + targets_missed <= total_rounds`
- Skor dihitung server-side: `targets_hit * 10 - traps_hit * 5`
- Skor dibatasi 0-200

**Input untuk Quiz Blitz:**
```json
{
  "participant_token": "token_string",
  "game_key": "quiz",
  "idempotency_key": "client-generated-uuid",
  "answers": [
    { "question_id": "uuid", "selected_index": 0, "response_time_ms": 5234 },
    // ...
  ]
}
```

**Validasi Quiz:**
- Jawaban dinilai server-side
- Skor: `correct_answers * 20`
- Accuracy: `correct_answers / total_questions * 100`

**Proses umum:**
1. Cek idempotency key — jika sudah ada, return hasil sebelumnya
2. Validasi token dan session
3. Validasi metrics/data
4. Hitung skor di server
5. Simpan ke `game_results` dan update `participants.status`
6. Return hasil validasi

**Response:**
```json
{
  "success": true,
  "score": 180,
  "accuracy": 85.5,
  "completed_at": "2026-10-18T10:30:00Z"
}
```

#### Checklist Fase 5

- [ ] Endpoint `start-game` untuk 3 game
- [ ] Endpoint `submit-game-result` dengan idempotency
- [ ] Validasi skor di server (bukan trust dari client)
- [ ] Quiz dinilai di server, jawaban benar tidak dikirim ke client
- [ ] Retry tidak menggandakan hasil
- [ ] Test: kirim hasil sama 2x → hasil tidak ganda

---

### Fase 6: Leaderboard & Admin Operations (1 hari)

**Tujuan:** Menyediakan data leaderboard dan operasi admin.

#### API Endpoint: `get-public-leaderboard`

**Query:**
```sql
select * from public_leaderboard
order by total_score desc, average_accuracy desc, completed_at asc
limit 100;
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "display_name": "Ahmad_01_IXA",
      "class_name": "IXA",
      "total_score": 580,
      "average_accuracy": 95.3
    }
  ],
  "updated_at": "2026-10-18T10:35:00Z"
}
```

#### API Endpoint: `get-admin-dashboard`

**Akses:** Admin only

**Response:**
```json
{
  "event": { "name": "SCC 2026", "status": "open" },
  "statistics": {
    "total_participants": 150,
    "completed": 45,
    "in_progress": 80,
    "not_started": 25,
    "average_score": 420.5
  },
  "top_10": [...],
  "recent_activity": [...]
}
```

#### API Endpoint: `get-admin-participants`

**Query params:** `search`, `class`, `status`, `page`, `limit`

**Response:**
```json
{
  "participants": [
    {
      "id": "uuid",
      "display_name": "Ahmad_01_IXA",
      "full_name": "Ahmad Fauzi",
      "class_name": "IXA",
      "status": "completed",
      "scores": { "reflex": 180, "memory": 200, "quiz": 200 },
      "total_score": 580,
      "completed_at": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 150 }
}
```

#### API Endpoint: `export-csv`

**Proses:**
1. Query semua data yang relevan
2. Generate CSV di server
3. Return sebagai downloadable file

**Format CSV:**
```csv
Peringkat,Nama,Kelas,Reflex Rush,Memory Rush,Quiz Blitz,Total,Akurasi,Waktu
1,Ahmad_01_IXA,IXA,180,200,200,580,95.3,2026-10-18 10:30:00
```

#### API Endpoint: `update-competition-settings`

**Akses:** Admin only

**Input:**
```json
{
  "registration_open": false,
  "status": "closed"
}
```

**Proses:**
1. Validasi perubahan
2. Update `events` dan `competition_settings`
3. Log ke `admin_activity`

#### Checklist Fase 6

- [ ] Endpoint leaderboard publik
- [ ] Endpoint dashboard admin
- [ ] Endpoint list peserta dengan filter
- [ ] Endpoint ekspor CSV
- [ ] Endpoint update settings
- [ ] Audit logging untuk perubahan penting

---

### Fase 7: Testing (1-2 hari)

**Tujuan:** Memastikan semua komponen bekerja dengan benar.

#### Unit Test (Edge Functions)

- [ ] Test validasi input untuk setiap endpoint
- [ ] Test kalkulasi skor untuk 3 game
- [ ] Test idempotency
- [ ] Test tie-break logic

#### Integration Test

- [ ] Test alur registrasi → game 1 → game 2 → game 3 → hasil
- [ ] Test refresh halaman mempertahankan progres
- [ ] Test duplikasi pendaftaran ditolak
- [ ] Test submit ganda tidak menggandakan hasil
- [ ] Test admin login dan akses dashboard
- [ ] Test RLS mencegah akses tidak sah

#### Load Test

Gunakan k6 atau Artillery:

```javascript
// k6 script example
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 32 },
    { duration: '2m', target: 64 },
    { duration: '2m', target: 96 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Simulate registration
  // Simulate game submission
  // Simulate leaderboard fetch
}
```

**Target:**
- p95 < 1500ms untuk endpoint penting
- Error rate < 1%
- Tidak ada hasil ganda

#### Checklist Fase 7

- [ ] Unit test coverage > 80%
- [ ] Integration test untuk semua alur utama
- [ ] Load test 10, 32, 64, 96 pengguna virtual
- [ ] Dokumentasikan hasil load test

---

### Fase 8: Deployment & Monitoring (0.5-1 hari)

**Tujuan:** Deploy ke production dengan monitoring yang memadai.

#### Langkah

1. Jalankan semua migration di production
2. Seed data: event, quiz questions, admin users
3. Verifikasi RLS di production
4. Setup monitoring di Supabase dashboard
5. Setup alert untuk error rate tinggi
6. Smoke test di production

#### Checklist Fase 8

- [ ] Migration berhasil di production
- [ ] Seed data lengkap
- [ ] Admin dapat login
- [ ] Semua endpoint dapat diakses
- [ ] Monitoring aktif
- [ ] Dokumentasikan credentials dan prosedur

---

## 7. Kontrak Integrasi dengan Frontend

### Environment Variables

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

### Client-side Supabase Usage

```javascript
import { supabase } from '@/lib/supabase';

// Register participant
const { data, error } = await supabase.functions.invoke('register-participant', {
  body: { full_name, attendance_number, class_name }
});

// Get progress
const { data } = await supabase.functions.invoke('get-progress', {
  body: { token }
});

// Submit game result
const { data } = await supabase.functions.invoke('submit-game-result', {
  body: { participant_token, game_key, idempotency_key, metrics }
});
```

### Enum Values

**Game keys:** `reflex`, `memory`, `quiz`

**Participant status:**
- `registered` — Belum mulai
- `playing_reflex` — Sedang bermain Reflex Rush
- `playing_memory` — Sedang bermain Memory Rush
- `playing_quiz` — Sedang bermain Quiz Blitz
- `completed` — Selesai semua game
- `disqualified` — Didiskualifikasi

**Event status:** `draft`, `open`, `closed`

---

## 8. Persyaratan Keamanan

- [ ] `service_role` key TIDAK PERNAH di frontend
- [ ] RLS aktif di semua tabel
- [ ] Token sesi di-hash, tidak disimpan plain text
- [ ] Jawaban quiz tidak dikirim ke client sebelum dinilai
- [ ] Rate limiting di endpoint pendaftaran dan submit
- [ ] Input validation di semua endpoint
- [ ] Error message tidak membocorkan informasi sensitif
- [ ] HTTPS untuk semua komunikasi

---

## 9. Persyaratan Performa

- [ ] Indeks di kolom yang sering di-query
- [ ] Batch insert untuk quiz questions
- [ ] Pagination untuk list peserta dan leaderboard
- [ ] Query optimization untuk leaderboard (materialized view jika perlu)
- [ ] CDN untuk static assets (Vercel)
- [ ] Minimal backend request selama gameplay

---

## 10. Acceptance Criteria

### Fungsional

- [ ] Peserta dapat mendaftar dengan validasi ketat
- [ ] Peserta dapat melanjutkan sesi setelah refresh
- [ ] Hasil game divalidasi dan disimpan dengan benar
- [ ] Leaderboard menampilkan peserta yang selesai dengan tie-break yang benar
- [ ] Admin dapat login dan mengakses dashboard
- [ ] Admin dapat melihat, filter, dan mengekspor data peserta
- [ ] Admin dapat membuka/menutup kompetisi dengan konfirmasi

### Non-fungsional

- [ ] p95 response time < 1500ms pada 96 concurrent users
- [ ] Error rate < 1%
- [ ] Tidak ada hasil ganda dari retry
- [ ] Tidak ada kebocoran data sensitif
- [ ] RLS terverifikasi dengan audit

---

## 11. Definisi Selesai

- [ ] Semua migration di production
- [ ] Semua endpoint berfungsi dan terdokumentasi
- [ ] Testing lengkap dengan hasil tercatat
- [ ] Load test berhasil dengan target tercapai
- [ ] Admin dapat mengelola kompetisi end-to-end
- [ ] Tidak ada bug kritis
- [ ] Dokumentasi API lengkap

---

## 12. Risiko dan Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Supabase region tidak tersedia | Pilih region terdekat, uji latency |
| Load test gagal | Optimasi query, indeks, caching |
| Token collision | Gunakan entropy yang cukup (256-bit) |
| Jawaban quiz bocor | RLS ketat, tidak return correct_option_index |
| Admin tidak bisa login | Siapkan backup admin account, dokumentasikan prosedur reset |

---

## 13. Urutan Rekomendasi

1. **Fase 1** — Database schema (fondasi)
2. **Fase 2** — RLS (keamanan)
3. **Fase 3** — Auth admin (prasyarat admin ops)
4. **Fase 4** — Registrasi peserta (alur utama)
5. **Fase 5** — Game submission (inti kompetisi)
6. **Fase 6** — Leaderboard & admin ops (fitur lengkap)
7. **Fase 7** — Testing (validasi)
8. **Fase 8** — Deployment (production)

---

## 14. File & Folder yang Dibuat/Dimodifikasi

### Baru (Supabase)

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
│   ├── export-csv/
│   └── update-competition-settings/
└── seed/
    ├── quiz_questions.sql
    └── admin_users.sql
```

### Dimodifikasi (Frontend)

- `src/lib/supabase.js` — Konfigurasi client
- `src/lib/env.js` — Environment variables
- `.env` — Tambah `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
- `.env.example` — Template untuk tim

---

## 15. Catatan Tambahan

- Koordinasi dengan Rama dan Rafa untuk integrasi frontend-backend
- Gunakan branch terpisah untuk development
- Code review sebelum merge ke main
- Dokumentasikan setiap perubahan penting
- Backup database sebelum migration besar
