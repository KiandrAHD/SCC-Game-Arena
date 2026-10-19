# Panduan Setup Supabase & Backend: SCC Game Arena

Dokumen ini menjelaskan tata cara inisialisasi, migrasi, konfigurasi akun admin, dan deployment backend SCC Game Arena menggunakan Supabase (PostgreSQL, Auth, dan Edge Functions).

---

## 1. Persyaratan Lingkungan (Prerequisites)

- **Node.js**: Versi 18+ (disarankan Node.js 20 atau 22).
- **Docker Desktop**: Aktif dan berjalan (jika menggunakan Supabase CLI lokal).
- **Supabase CLI**: Terpasang secara global (`npm install -g supabase`) atau via package runner (`npx supabase`).

---

## 2. Struktur Backend di Direktori Repository

```
supabase/
├── config.toml                     # Konfigurasi Supabase CLI & port lokal
├── migrations/
│   └── 202610190001_backend.sql    # Skema lengkap, constraint, RLS, view, dan fungsi RPC
├── seed.sql                        # Data event awal, settings, dan 10 soal Quiz Blitz
└── functions/
    ├── _shared/
    │   └── core.ts                 # Helper auth token SHA-256, CORS, scoring, dan sanitasi CSV
    ├── register-participant/       # POST: Validasi identitas, token generation, anti-duplikat
    ├── get-progress/               # POST: Cek status peserta & progress game
    ├── start-game/                 # POST: Enforce urutan game, generate challenge/soal tanpa kunci
    ├── submit-game-result/         # POST: Validasi skor server-side & idempotency key
    ├── get-public-leaderboard/     # GET: Leaderboard publik (hanya 3 game valid, tanpa data privat)
    ├── get-admin-dashboard/        # GET: Statistik peserta, top 10, dan recent activity
    ├── get-admin-participants/     # POST: Manajemen peserta terpaginasi & filter pencarian
    ├── get-admin-leaderboard/      # GET: Leaderboard admin lengkap dengan rincian tiap game
    ├── export-csv/                 # GET: Ekspor hasil ke CSV dengan proteksi formula injection
    └── update-competition-settings/# POST: Buka/tutup pendaftaran & konfigurasi kompetisi
```

---

## 3. Setup Lokal Menggunakan Supabase CLI

### 3.1 Menjalankan Container Lokal
Jalankan perintah berikut di root folder project:
```bash
# Inisialisasi dan jalankan container Supabase
npx supabase start
```
Setelah container siap, CLI akan menampilkan URL lokal dan keys:
- **API URL**: `http://127.0.0.1:54321`
- **GraphQL URL**: `http://127.0.0.1:54321/graphql/v1`
- **DB URL**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Studio URL**: `http://127.0.0.1:54323`
- **Inbucket (Email)**: `http://127.0.0.1:54324`
- **anon key**: `eyJhbGci...`
- **service_role key**: `eyJhbGci...`

### 3.2 Menjalankan Migrasi dan Seed Data
```bash
# Terapkan migrasi dan seed.sql otomatis
npx supabase db reset
```

### 3.3 Menjalankan Edge Functions Secara Lokal
```bash
# Menjalankan seluruh fungsi lokal dengan environment file
npx supabase functions serve --env-file ./supabase/.env.local
```

File `./supabase/.env.local` dapat berisi:
```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<service_role_key_dari_supabase_start>
```

---

## 4. Setup Akun Admin Pertama

Supabase Auth mengelola kredensial login admin. Untuk mendaftarkan akun admin:

### Cara 1: Menggunakan Supabase Studio / Dashboard
1. Buka Studio (`http://127.0.0.1:54323` untuk lokal atau dashboard cloud Supabase).
2. Masuk ke menu **Authentication** > **Users** > **Add User** (Create User).
3. Masukkan Email dan Password admin.
4. Buka **SQL Editor**, jalankan query untuk mendaftarkan user ID ke tabel `admin_users`:
   ```sql
   insert into public.admin_users (id, role)
   values ('<USER_UUID_DARI_AUTH_USERS>', 'super_admin');
   ```

### Cara 2: Melalui Supabase SQL Script
```sql
-- Contoh membuat user langsung di auth schema (hanya untuk testing / bootstrap lokal)
-- Di cloud production, selalu buat user melalui Supabase Auth Dashboard terlebih dahulu.
insert into public.admin_users (id, role)
select id, 'super_admin' from auth.users where email = 'admin@smktelkom-pwt.sch.id';
```

---

## 5. Deployment ke Supabase Remote (Production)

### 5.1 Login dan Hubungkan Project
```bash
# 1. Login ke akun Supabase
npx supabase login

# 2. Hubungkan ke project ref target
npx supabase link --project-ref <your-project-ref>
```

### 5.2 Terapkan Migrasi ke Database Remote
```bash
# Terapkan semua migrasi baru ke database remote
npx supabase db push
```

### 5.3 Deploy Edge Functions
Deploy semua Edge Functions yang diperlukan:
```bash
npx supabase functions deploy register-participant --no-verify-jwt
npx supabase functions deploy get-progress --no-verify-jwt
npx supabase functions deploy start-game --no-verify-jwt
npx supabase functions deploy submit-game-result --no-verify-jwt
npx supabase functions deploy get-public-leaderboard --no-verify-jwt

# Endpoint admin (autentikasi bearer token divalidasi langsung di dalam handler kode)
npx supabase functions deploy get-admin-dashboard --no-verify-jwt
npx supabase functions deploy get-admin-participants --no-verify-jwt
npx supabase functions deploy get-admin-leaderboard --no-verify-jwt
npx supabase functions deploy export-csv --no-verify-jwt
npx supabase functions deploy update-competition-settings --no-verify-jwt
```
> *Catatan:* Flag `--no-verify-jwt` digunakan agar fungsi dapat menangani preflight CORS OPTIONS dan validasi bearer token secara seragam di dalam handler aplikasi.

### 5.4 Konfigurasi Secrets pada Edge Functions Remote
Pastikan Supabase Edge Runtime memiliki akses ke variabel environment:
```bash
npx supabase secrets set SUPABASE_URL=https://<your-project-ref>.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## 6. Verifikasi dan Aturan Keamanan (Security Checklist)

1. **Service Role Key**:
   - **DILARANG KERAS** memasukkan `SUPABASE_SERVICE_ROLE_KEY` ke dalam file `.env` frontend atau mengimpornya ke kode React (`src/`).
   - Service Role Key hanya boleh disimpan di Supabase Edge Secrets.
2. **Kerahasiaan Kunci Jawaban Kuis**:
   - Kolom `correct_option_index` di tabel `quiz_questions` dilindungi oleh RLS dan tidak pernah dikirimkan ke browser oleh endpoint `start-game`.
   - Penilaian soal dikalkulasikan secara eksklusif di server pada saat `submit-game-result`.
3. **Idempotency & Race Condition**:
   - Setiap pengiriman skor wajib menyertakan `idempotency_key`. Pengiriman berulang dengan payload yang sama mengembalikan hasil identik tanpa mengubah state.
   - Fungsi RPC `complete_game` mengeksekusi validasi, penulisan hasil, dan penguncian row sesi secara atomik.
4. **Formula Injection Sanitasi**:
   - Fitur ekspor CSV di `export-csv` secara otomatis memfilter karakter berbahaya (`=`, `+`, `-`, `@`) dengan awalan kutip tunggal (`'`).
