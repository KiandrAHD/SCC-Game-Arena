# SCC Game Arena — UI/UX & Implementation Specification

Dokumen ini menjadi acuan desain dan implementasi website kompetisi mini-game **SCC Game Arena** untuk siswa kelas IX SMP Negeri 1 Karangpucung dalam kegiatan SCC SMK Telkom Purwokerto.

## 1. Ringkasan Produk

SCC Game Arena adalah kompetisi yang terdiri dari tiga mini-game:

1. **Reflex Rush** — menguji kecepatan reaksi.
2. **Memory Rush** — menguji ingatan terhadap pola.
3. **Quiz Blitz** — menguji wawasan dan kecepatan menjawab.

Peserta harus memainkan ketiganya secara berurutan. Setiap game memiliki nilai maksimal 200 poin sehingga total maksimal adalah 600 poin.

### Target pengguna

- Peserta: siswa kelas IX SMP Negeri 1 Karangpucung.
- Admin: panitia SCC SMK Telkom Purwokerto.

### Prinsip produk

- Tidak membutuhkan akun peserta atau kode sesi.
- Data peserta cukup berupa nama, nomor absen, dan kelas.
- Progres dan skor disimpan otomatis.
- Leaderboard publik hanya menampilkan peserta yang menyelesaikan ketiga game.
- Informasi sensitif dan token sesi tidak ditampilkan di UI publik.

---

## 2. Teknologi yang Direkomendasikan

- React 19
- Vite
- TypeScript atau JavaScript
- Tailwind CSS v4
- Lucide React
- Supabase
  - Database peserta dan hasil.
  - Admin authentication.
  - Realtime leaderboard dan aktivitas.
- Vercel
  - Hosting aplikasi.
  - Environment variables.

---

## 3. Arah Visual

### Karakter

- Minimalis dan modern.
- Playful, tetapi tidak kekanak-kanakan.
- Hierarki visual jelas.
- Whitespace luas.
- Ringan dan realistis untuk dikembangkan.
- Desktop-first dengan acuan frame utama **1440 × 900 px**.

### Warna

| Token | Nilai | Penggunaan |
|---|---:|---|
| `--color-primary` | `#E62E37` | CTA, indikator aktif, aksen utama |
| `--color-primary-hover` | `#C91F2A` | Hover tombol utama |
| `--color-text` | `#18202B` | Teks utama |
| `--color-muted` | `#687386` | Teks sekunder |
| `--color-border` | `#E7E9EE` | Border dan divider |
| `--color-surface` | `#FFFFFF` | Card dan navbar |
| `--color-background` | `#FAFBFC` | Latar halaman |
| `--color-dark` | `#202936` | Sidebar dan area kontras |
| `--color-success` | `#159365` | Status sukses |
| `--color-warning` | `#AA7100` | Peringatan dan peringkat |
| `--color-info` | `#2672CC` | Status informatif |

Jangan menggunakan gradien mencolok. Gradien ringan boleh digunakan sebagai pencahayaan latar, bukan sebagai elemen utama.

### Tipografi

- Font utama: **Inter**.
- Alternatif: **Poppins**.
- Heading utama: 34–54 px, berat 700–800.
- Heading section: 24–32 px, berat 700.
- Heading card: 14–18 px, berat 600–700.
- Body: 12–16 px, berat 400–500.
- Label: 9–12 px, berat 600–700.
- Gunakan line-height lega untuk deskripsi.

### Bentuk dan elevasi

- Radius tombol/input: 8–10 px.
- Radius card: 14–16 px.
- Bayangan card sangat halus.
- Border menggunakan abu-abu terang.
- Hindari elemen 3D dan bayangan berat.

### Ikon

Gunakan `lucide-react`. Ikon utama:

- `Gamepad2`
- `Zap`
- `Brain`
- `ListChecks`
- `Target`
- `Trophy`
- `Medal`
- `Clock3`
- `ShieldCheck`
- `CheckCircle2`
- `Users`
- `Settings`
- `LayoutDashboard`
- `Download`
- `Search`

---

## 4. Struktur Navigasi

### Alur peserta

```text
Landing Page
  → Registrasi Peserta
  → Aturan Kompetisi
  → Game 1: Reflex Rush
  → Game 2: Memory Rush
  → Game 3: Quiz Blitz
  → Hasil Akhir
  → Leaderboard Publik
```

### Alur admin

```text
Admin Login
  → Dashboard
  → Manajemen Peserta
  → Hasil & Leaderboard
  → Pengaturan Kompetisi
```

### Route yang disarankan

```text
/
/register
/rules
/play/reflex
/play/memory
/play/quiz
/result
/leaderboard

/admin/login
/admin
/admin/participants
/admin/results
/admin/settings
```

Gunakan route guard untuk semua halaman `/admin`, kecuali `/admin/login`.

---

## 5. Komponen Design System

### 5.1 Button

Variants:

- `primary` — CTA utama berwarna merah.
- `secondary` — putih dengan border.
- `ghost` — tanpa surface.
- `danger` — aksi destruktif.

States:

- Default
- Hover
- Focus
- Loading
- Disabled

Props yang disarankan:

```ts
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ElementType;
  children: React.ReactNode;
};
```

### 5.2 Input

Input harus memiliki:

- Label.
- Placeholder.
- Optional leading icon.
- Helper text.
- Error message.
- Valid state.
- Disabled state.

Validasi dilakukan saat blur dan submit. Jangan hanya mengandalkan warna; sertakan ikon atau pesan.

### 5.3 Badge

Variants:

- Neutral
- Primary/red
- Success/green
- Warning/amber
- Info/blue

Contoh penggunaan:

- `Selesai`
- `Bermain`
- `Belum mulai`
- `Kompetisi aktif`
- `Tersimpan`

### 5.4 Card

Jenis card:

- Game card
- Statistic card
- Form card
- Table container
- Feedback card
- Result card
- Confirmation card

### 5.5 Progress Bar

Digunakan untuk:

- Progres game.
- Progres ronde.
- Progres jumlah soal.
- Persentase peserta selesai.

Progress harus memiliki `aria-valuemin`, `aria-valuemax`, dan `aria-valuenow`.

### 5.6 Timer

States:

- Normal.
- Warning saat waktu ≤ 10 detik.
- Critical saat waktu ≤ 5 detik.
- Paused.
- Expired.

Timer hanya ditampilkan dalam format yang relevan:

```text
00:40
00:12
Ronde 6/8
```

Waktu hasil akhir dan tie-break harus menggunakan timestamp server, bukan waktu perangkat peserta.

### 5.7 Toast

Variants:

- Success: progres tersimpan.
- Error: koneksi atau penyimpanan gagal.
- Warning: waktu hampir habis.
- Info: kompetisi ditutup atau status berubah.

Toast tidak boleh menutupi kontrol game penting.

### 5.8 Modal konfirmasi

Digunakan untuk:

- Menutup kompetisi.
- Menghapus atau mereset data peserta.
- Keluar saat game masih berlangsung.
- Mengaktifkan permainan ulang.

Modal harus memiliki:

- Judul yang eksplisit.
- Penjelasan dampak.
- Tombol batal.
- Tombol konfirmasi dengan variant `danger` untuk aksi destruktif.

### 5.9 Table

Fitur:

- Sticky header jika data panjang.
- Search.
- Filter kelas.
- Filter status.
- Sorting.
- Pagination bila peserta lebih dari 50.
- Empty state.
- Loading skeleton.
- Error state dan tombol coba lagi.

---

## 6. Spesifikasi Halaman Peserta

### 6.1 Landing Page

#### Tujuan

Mengenalkan kompetisi dan mengarahkan peserta menuju registrasi.

#### Konten

- Logo dan identitas SCC Game Arena.
- Headline:
  - “Siap jadi juara di SCC Game Arena?”
- Deskripsi singkat.
- Tombol `Mulai bermain`.
- Tombol sekunder `Lihat aturan`.
- Jumlah peserta yang telah bergabung.
- Tiga game card.
- Leaderboard preview tiga peserta teratas.

#### Interaksi

- `Mulai bermain` → registrasi.
- `Lihat aturan` → halaman aturan.
- `Lihat semua peringkat` → leaderboard.

### 6.2 Registrasi Peserta

#### Field

- Nama lengkap.
- Nomor absen.
- Kelas.
- Checkbox persetujuan aturan.

#### Validasi

- Nama minimal 3 karakter.
- Nama hanya menerima karakter yang diizinkan.
- Nomor absen berupa angka dan berada dalam rentang kelas.
- Kelas wajib dipilih.
- Persetujuan aturan wajib dicentang.
- Kombinasi nomor absen dan kelas harus unik.

#### Format nama tampilan

```text
Ahmad_01_IXA
```

Format:

```text
{namaPertama}_{nomorAbsenDuaDigit}_{kelasTanpaSpasi}
```

Jangan meminta:

- Email peserta.
- Kata sandi peserta.
- Akun.
- Kode sesi.

### 6.3 Aturan Kompetisi

Harus menjelaskan:

- Game dimainkan secara berurutan.
- Setiap game maksimal 200 poin.
- Total maksimal 600 poin.
- Durasi masing-masing game.
- Progres disimpan otomatis.
- Ketentuan pengulangan game.
- Leaderboard hanya menampilkan peserta yang selesai.
- Tie-break:
  1. Total skor.
  2. Rata-rata akurasi.
  3. Waktu penyelesaian berdasarkan timestamp server.

### 6.4 Reflex Rush

#### Elemen

- Nama game dan petunjuk.
- Skor real-time.
- Timer 40 detik.
- Progress.
- Jumlah target ditemukan.
- Combo.
- Arena permainan.
- Target merah.
- Jebakan abu-abu.
- Tombol mulai.
- Tombol jeda jika diizinkan.
- Feedback poin.
- Hasil game.

#### Aturan rekomendasi

- Klik target: mendapatkan poin.
- Klik cepat berturut-turut: combo.
- Klik jebakan: pengurangan poin atau combo terputus.
- Tidak ada skor negatif.
- Target diposisikan di dalam batas arena.

#### State

- Ready.
- Countdown.
- Playing.
- Paused.
- Time warning.
- Finished.
- Save pending.
- Save success.
- Save error.

### 6.5 Memory Rush

#### Elemen

- Delapan ronde.
- Tiga kesempatan salah.
- Pola warna atau simbol.
- Urutan pilihan peserta.
- Progress ronde.
- Skor.
- Feedback benar/salah.

#### Aturan rekomendasi

- Ronde pertama menggunakan pola paling pendek.
- Panjang pola bertambah secara bertahap.
- Jawaban benar memberi poin.
- Jawaban salah mengurangi satu kesempatan.
- Game selesai setelah ronde delapan atau kesempatan habis.

#### State

- Showing pattern.
- Awaiting input.
- Correct.
- Incorrect.
- Round complete.
- Game complete.

### 6.6 Quiz Blitz

#### Elemen

- Nomor soal.
- Progress 10 soal.
- Kategori.
- Kartu pertanyaan.
- Empat opsi jawaban.
- Timer per soal.
- Skor.
- Akurasi.
- Feedback jawaban.

#### Perilaku

- Opsi tidak dapat diganti setelah dikonfirmasi.
- Jawaban benar ditandai hijau.
- Jawaban salah ditandai merah dan jawaban benar tetap ditampilkan.
- Timer habis dianggap tidak menjawab.
- Setelah feedback singkat, lanjut ke pertanyaan berikutnya.

### 6.7 Hasil Akhir

#### Konten

- Status semua game selesai.
- Nama tampilan peserta.
- Skor tiap game.
- Total skor dari 600.
- Peringkat sementara.
- Rata-rata akurasi.
- Waktu total.
- Ringkasan performa.
- Tombol leaderboard.
- Tombol mainkan kembali.

Tombol `Mainkan kembali` harus disabled atau disembunyikan jika aturan kompetisi tidak mengizinkan.

### 6.8 Leaderboard Publik

#### Konten

- Peringkat 1–3 ditonjolkan.
- Tabel peserta lainnya.
- Nama tampilan.
- Kelas.
- Total skor.
- Status selesai.
- Waktu pembaruan.

#### Privasi

Jangan tampilkan:

- Token sesi.
- ID database.
- Email.
- Nomor telepon.
- Informasi authentication.
- Timestamp mentah yang dapat digunakan untuk mengidentifikasi aktivitas personal.

---

## 7. Spesifikasi Halaman Admin

### 7.1 Admin Login

#### Field

- Email admin.
- Kata sandi.
- Checkbox ingat saya.
- Lupa kata sandi.

Gunakan Supabase Authentication. Pesan error tidak boleh mengungkap apakah email tertentu terdaftar.

### 7.2 Admin Dashboard

#### Ringkasan

- Total peserta.
- Peserta selesai.
- Peserta sedang bermain.
- Peserta belum mulai.
- Rata-rata skor.
- Status kompetisi.

#### Modul

- Leaderboard ringkas.
- Aktivitas terbaru.
- Shortcut ekspor laporan.
- Indikator realtime.

### 7.3 Manajemen Peserta

#### Kolom

- Nama.
- Nomor absen.
- Kelas.
- Progres Game 1.
- Progres Game 2.
- Progres Game 3.
- Skor total.
- Status.
- Menu detail.

#### Fitur

- Search nama atau nomor absen.
- Filter kelas.
- Filter status.
- Detail peserta.
- Ekspor CSV.

### 7.4 Manajemen Hasil & Leaderboard

#### Kolom

- Peringkat.
- Nama.
- Kelas.
- Skor Reflex Rush.
- Skor Memory Rush.
- Skor Quiz Blitz.
- Total skor.
- Rata-rata akurasi.
- Waktu penyelesaian.
- Status validasi.

#### Tie-break

Sorting leaderboard:

```sql
ORDER BY
  total_score DESC,
  average_accuracy DESC,
  completed_at ASC
```

`completed_at` harus dibuat oleh server.

### 7.5 Pengaturan Kompetisi

#### Status

- `draft`
- `open`
- `closed`

#### Kontrol

- Buka/tutup pendaftaran.
- Izinkan atau larang permainan ulang.
- Maksimum skor tiap game.
- Durasi game.
- Jumlah ronde Memory Rush.
- Jumlah soal Quiz Blitz.

#### Menutup kompetisi

Sebelum kompetisi ditutup:

1. Tampilkan modal konfirmasi.
2. Jelaskan bahwa peserta tidak dapat mendaftar atau melanjutkan game.
3. Minta konfirmasi eksplisit.
4. Simpan audit log.

---

## 8. Status Peserta

Gunakan status yang konsisten:

```ts
type ParticipantStatus =
  | "registered"
  | "playing_reflex"
  | "playing_memory"
  | "playing_quiz"
  | "completed"
  | "disqualified";
```

Label UI:

| Data | Label UI |
|---|---|
| `registered` | Belum mulai |
| `playing_reflex` | Game 1 |
| `playing_memory` | Game 2 |
| `playing_quiz` | Game 3 |
| `completed` | Selesai |
| `disqualified` | Didiskualifikasi |

---

## 9. Struktur Data Supabase

### `participants`

```sql
create table participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  display_name text not null unique,
  attendance_number integer not null,
  class_name text not null,
  status text not null default 'registered',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (attendance_number, class_name)
);
```

### `game_results`

```sql
create table game_results (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id),
  game_type text not null,
  score integer not null check (score between 0 and 200),
  accuracy numeric not null default 0,
  duration_ms integer not null,
  metadata jsonb not null default '{}',
  completed_at timestamptz not null default now(),
  unique (participant_id, game_type)
);
```

### `competition_settings`

```sql
create table competition_settings (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft',
  registration_open boolean not null default false,
  replay_allowed boolean not null default false,
  reflex_max_score integer not null default 200,
  memory_max_score integer not null default 200,
  quiz_max_score integer not null default 200,
  updated_at timestamptz not null default now()
);
```

### `admin_activity`

```sql
create table admin_activity (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid,
  action text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

### View leaderboard

```sql
create view public_leaderboard as
select
  p.id,
  p.display_name,
  p.class_name,
  sum(gr.score) as total_score,
  avg(gr.accuracy) as average_accuracy,
  p.completed_at
from participants p
join game_results gr on gr.participant_id = p.id
where p.status = 'completed'
group by p.id, p.display_name, p.class_name, p.completed_at
having count(distinct gr.game_type) = 3;
```

---

## 10. Aturan Skor

### Batas nilai

```ts
const MAX_GAME_SCORE = 200;
const MAX_TOTAL_SCORE = 600;
```

Semua skor harus dibatasi di server:

```ts
const normalizedScore = Math.max(0, Math.min(rawScore, MAX_GAME_SCORE));
```

### Total skor

```ts
const totalScore =
  reflexScore +
  memoryScore +
  quizScore;
```

### Rata-rata akurasi

```ts
const averageAccuracy =
  (reflexAccuracy + memoryAccuracy + quizAccuracy) / 3;
```

### Ranking

1. Total skor terbesar.
2. Rata-rata akurasi terbesar.
3. `completed_at` paling awal.

Peserta yang belum menyelesaikan ketiga game tidak masuk leaderboard final.

---

## 11. State Penting

Setiap modul data harus memiliki:

### Loading

- Gunakan skeleton dengan ukuran yang mendekati konten asli.
- Hindari spinner penuh untuk tabel.

### Empty

Contoh:

- “Belum ada peserta yang menyelesaikan kompetisi.”
- “Tidak ada peserta yang sesuai dengan pencarian.”
- Berikan aksi yang relevan untuk admin.

### Error

Contoh:

- “Data belum berhasil dimuat.”
- Tombol `Coba lagi`.
- Jangan menghapus data lokal sebelum penyimpanan berhasil.

### Success

Contoh:

- “Progres berhasil disimpan.”
- “Pengaturan kompetisi diperbarui.”
- “CSV berhasil dibuat.”

### Offline atau koneksi tidak stabil

- Tampilkan banner kecil.
- Simpan event game sementara di memori/local storage.
- Sinkronkan kembali saat koneksi tersedia.
- Validasi skor tetap dilakukan oleh server.

---

## 12. Accessibility

- Kontras minimum WCAG AA.
- Semua tombol dapat diakses dengan keyboard.
- Gunakan focus ring yang jelas.
- Jangan hanya menggunakan warna untuk status.
- Arena Reflex Rush harus memiliki alternatif keyboard jika memungkinkan.
- Gunakan `aria-live` untuk:
  - Perubahan skor.
  - Feedback benar/salah.
  - Timer kritis.
- Modal harus melakukan focus trap.
- Target sentuh minimum 40 × 40 px.
- Hormati `prefers-reduced-motion`.

---

## 13. Motion

Gunakan animasi ringan:

- Hover button: 150–200 ms.
- Card hover: perubahan elevasi kecil.
- Feedback skor: fade dan translate pendek.
- Perpindahan ronde: fade.
- Toast: slide pendek.

Hindari:

- Parallax berat.
- Animasi 3D.
- Transisi panjang.
- Efek yang mengganggu timer atau performa game.

---

## 14. Struktur Folder yang Disarankan

```text
src/
├── app/
│   ├── router.tsx
│   └── providers.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Progress.tsx
│   │   ├── Timer.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   └── DataTable.tsx
│   ├── layout/
│   │   ├── PublicNavbar.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── AdminHeader.tsx
│   └── game/
│       ├── GameShell.tsx
│       ├── GameProgress.tsx
│       └── ScoreDisplay.tsx
├── features/
│   ├── registration/
│   ├── reflex-rush/
│   ├── memory-rush/
│   ├── quiz-blitz/
│   ├── leaderboard/
│   └── admin/
├── lib/
│   ├── supabase.ts
│   ├── scoring.ts
│   └── validation.ts
├── hooks/
│   ├── useGameSession.ts
│   ├── useCountdown.ts
│   └── useLeaderboard.ts
├── pages/
├── types/
└── index.css
```

---

## 15. Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Jangan memasukkan service role key ke aplikasi frontend.

---

## 16. Checklist Implementasi

### Peserta

- [ ] Registrasi tervalidasi.
- [ ] Nama tampilan dibentuk otomatis.
- [ ] Game hanya dapat dimainkan berurutan.
- [ ] Skor setiap game berada pada rentang 0–200.
- [ ] Progres tersimpan otomatis.
- [ ] Hasil akhir maksimal 600.
- [ ] Leaderboard hanya memuat peserta selesai.
- [ ] Tombol bermain ulang mengikuti pengaturan.

### Admin

- [ ] Login dan route guard aktif.
- [ ] Dashboard menggunakan data aktual.
- [ ] Search dan filter peserta bekerja.
- [ ] Detail progres peserta tersedia.
- [ ] Sorting leaderboard mengikuti tie-break.
- [ ] Ekspor CSV tidak memuat data sensitif.
- [ ] Penutupan kompetisi menggunakan modal konfirmasi.
- [ ] Perubahan penting dicatat di audit log.

### UI dan kualitas

- [ ] Layout optimal pada desktop 1440 × 900 px.
- [ ] Tidak ada overflow horizontal pada viewport target.
- [ ] Loading, empty, error, dan success state tersedia.
- [ ] Keyboard navigation bekerja.
- [ ] Reduced motion didukung.
- [ ] Tidak ada token sesi atau secret di UI.
- [ ] Build produksi berhasil.

---

## 17. Referensi Prototype Saat Ini

Prototype React yang tersedia di repository menggunakan pemilih layar **“Jelajahi layar”** di kanan bawah. Pemilih tersebut dapat digunakan untuk meninjau seluruh halaman tanpa backend:

- Landing Page
- Registrasi Peserta
- Aturan Kompetisi
- Tiga halaman game
- Hasil Akhir
- Leaderboard Publik
- Admin Login
- Admin Dashboard
- Manajemen Peserta
- Hasil & Leaderboard
- Pengaturan Kompetisi

Saat implementasi produksi dimulai, pemilih layar tersebut sebaiknya diganti dengan routing aplikasi yang sebenarnya.
