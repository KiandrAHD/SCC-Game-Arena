# Task Document: Frontend Implementation — Participant Flow

**Ditujukan untuk:** Rama (Frontend Engineer)
**Prioritas:** Tinggi
**Estimasi:** 5-7 hari kerja

---

## 1. Tujuan

Mengimplementasikan seluruh halaman dan fungsionalitas publik untuk peserta: landing page, registrasi, aturan kompetisi, tiga gameplay (Reflex Rush, Memory Rush, Quiz Blitz), hasil akhir, dan leaderboard publik. Semua harus terintegrasi dengan backend Supabase.

---

## 2. Konteks

- **Stack:** React 18.3.1, Vite 5.4.10, Tailwind CSS 3.4.14, Lucide React 0.460.0
- **Backend:** Supabase (dikelola Kiandra)
- **Target:** Responsive di desktop 1440×900 dan mobile

Repository saat ini:
- Semua halaman sudah ada di `src/app/router.jsx`
- Komponen UI dasar ada di `src/components/ui/`
- Gameplay masih placeholder
- Registrasi dan login belum terhubung ke backend
- Supabase client ada di `src/lib/supabase.js` (perlu konfigurasi)

---

## 3. Ruang Lingkup

### Termasuk

1. **Landing page** — Hero, informasi, CTA
2. **Registrasi** — Form, validasi, penyimpanan token
3. **Aturan kompetisi** — Konten statis
4. **Reflex Rush** — Gameplay lengkap dengan timer, scoring, dan submit
5. **Memory Rush** — Gameplay lengkap dengan pola dan validasi
6. **Quiz Blitz** — Gameplay lengkap dengan soal dari backend
7. **Hasil akhir** — Tampilan skor dan ringkasan
8. **Leaderboard publik** — Daftar peringkat
9. **State management** — Progres, sesi, retry logic

### Tidak Termasuk

- Halaman admin (tanggung jawab Rafa)
- Backend implementation (tanggung jawab Kiandra)
- Database schema dan migration

---

## 4. Kondisi Repository Saat Ini

| Halaman | Status | Keterangan |
|---------|--------|------------|
| Landing Page | ✅ Ada | `src/pages/public/LandingPage.jsx` |
| Register Page | ⚠️ Placeholder | `src/pages/public/RegisterPage.jsx` — belum terhubung backend |
| Rules Page | ⚠️ Placeholder | `src/pages/public/RulesPage.jsx` — konten statis |
| Reflex Rush | ⚠️ Placeholder | `src/pages/public/ReflexRushPage.jsx` — gameplay belum ada |
| Memory Rush | ⚠️ Placeholder | `src/pages/public/MemoryRushPage.jsx` — gameplay belum ada |
| Quiz Blitz | ⚠️ Placeholder | `src/pages/public/QuizBlitzPage.jsx` — gameplay belum ada |
| Result Page | ⚠️ Placeholder | `src/pages/public/ResultPage.jsx` — belum terhubung backend |
| Leaderboard Page | ⚠️ Placeholder | `src/pages/public/LeaderboardPage.jsx` — belum terhubung backend |

| Komponen UI | Status | Keterangan |
|-------------|--------|------------|
| Button | ✅ Ada | `src/components/ui/Button.jsx` |
| Input | ✅ Ada | `src/components/ui/Input.jsx` |
| Card | ✅ Ada | `src/components/ui/Card.jsx` |
| Badge | ✅ Ada | `src/components/ui/Badge.jsx` |
| Progress | ✅ Ada | `src/components/ui/Progress.jsx` |
| Timer | ✅ Ada | `src/components/ui/Timer.jsx` |

---

## 5. Prasyarat

- [ ] Backend API sudah berjalan (koordinasi dengan Kiandra)
- [ ] `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah dikonfigurasi
- [ ] Daftar kelas yang valid (dari panitia)
- [ ] Daftar soal Quiz Blitz (dari backend)
- [ ] Desain final dari SCC_GAME_ARENA_DESIGN.md sudah disetujui

---

## 6. Fase Implementasi

### Fase 1: Setup & Integrasi Supabase Client (0.5 hari)

**Tujuan:** Memastikan frontend dapat berkomunikasi dengan backend.

#### File yang perlu dikonfigurasi

**`.env`**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

**`src/lib/supabase.js`**
```javascript
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);
```

**`src/lib/env.js`**
```javascript
export const env = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};
```

#### Test koneksi

```javascript
// Di browser console atau test file
const { data, error } = await supabase.from('events').select('*');
console.log(data, error);
```

#### Checklist Fase 1

- [ ] `.env` sudah dikonfigurasi
- [ ] Supabase client dapat berkomunikasi dengan backend
- [ ] Test: fetch data dari tabel public

---

### Fase 2: Landing Page (0.5 hari)

**Tujuan:** Menampilkan halaman utama yang informatif dan mengarahkan ke registrasi.

#### Elemen yang harus ada

1. **Hero section**
   - Logo SCC Game Arena
   - Headline: "Siap jadi juara di SCC Game Arena?"
   - Deskripsi singkat
   - Tombol "Mulai Bermain" → `/register`
   - Tombol "Lihat Aturan" → `/rules`

2. **Info cards**
   - Jumlah peserta terdaftar (fetch dari backend)
   - Tiga game card dengan ikon dan deskripsi singkat

3. **Leaderboard preview**
   - Top 3 peserta (fetch dari backend)
   - Tombol "Lihat Semua" → `/leaderboard`

#### Data dari backend

```javascript
// Fetch statistik
const { data: stats } = await supabase
  .from('participants')
  .select('id', { count: 'exact', head: true });

// Fetch top 3 leaderboard
const { data: topThree } = await supabase.functions.invoke('get-public-leaderboard', {
  body: { limit: 3 }
});
```

#### Checklist Fase 2

- [ ] Hero section responsif
- [ ] Tombol navigasi bekerja
- [ ] Jumlah peserta dari backend (real-time atau on-load)
- [ ] Top 3 leaderboard preview
- [ ] Mobile-friendly

---

### Fase 3: Registrasi Peserta (1 hari)

**Tujuan:** Form registrasi dengan validasi ketat dan penyimpanan token sesi.

#### Field form

| Field | Validasi |
|-------|----------|
| Nama lengkap | 1-40 karakter, trim whitespace, karakter yang diizinkan |
| Nomor absen | Integer, dalam rentang yang valid (cek dengan backend) |
| Kelas | Dropdown, dari daftar kelas yang dikonfigurasi |
| Persetujuan aturan | Checkbox wajib dicentang |

#### Validasi real-time

- Nama: minimal 1 karakter setelah trim
- Nomor absen: harus angka positif
- Kelas: harus dipilih
- Checkbox: harus dicentang

#### Proses submit

```javascript
const handleRegister = async (formData) => {
  setLoading(true);
  setError(null);

  try {
    const { data, error } = await supabase.functions.invoke('register-participant', {
      body: {
        full_name: formData.fullName.trim(),
        attendance_number: parseInt(formData.attendanceNumber),
        class_name: formData.className
      }
    });

    if (error) throw error;

    // Simpan token ke localStorage
    localStorage.setItem('participant_token', data.token);
    localStorage.setItem('participant_id', data.participant_id);
    localStorage.setItem('display_name', data.display_name);

    // Redirect ke aturan
    navigate('/rules');

  } catch (err) {
    if (err.status === 409) {
      setError('Kombinasi kelas dan nomor absen sudah terdaftar.');
    } else if (err.status === 503) {
      setError('Kompetisi belum dibuka. Silakan tunggu petunjuk panitia.');
    } else {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    }
  } finally {
    setLoading(false);
  }
};
```

#### Pencegahan duplikasi

- Jika kombinasi sudah terdaftar, tampilkan pesan:
  > "Nomor absen ini sudah terdaftar di kelas tersebut. Jika ini adalah Anda, silakan lanjutkan sesi Anda atau hubungi panitia."

- Tambah tombol "Lanjutkan Sesi" yang mengarah ke `/rules` (cek token di localStorage)

#### Checklist Fase 3

- [ ] Form dengan validasi real-time
- [ ] Error handling untuk semua kasus
- [ ] Token disimpan di localStorage
- [ ] Redirect ke `/rules` setelah sukses
- [ ] Handle kasus duplikasi dengan baik

---

### Fase 4: Aturan Kompetisi (0.5 hari)

**Tujuan:** Menampilkan aturan kompetisi secara jelas.

#### Konten

1. **Urutan game**
   - Game 1: Reflex Rush (40 detik)
   - Game 2: Memory Rush (8 ronde)
   - Game 3: Quiz Blitz (10 soal)

2. **Scoring**
   - Setiap game: maksimal 200 poin
   - Total maksimal: 600 poin

3. **Aturan penting**
   - Game dimainkan berurutan
   - Progres disimpan otomatis
   - Tidak bisa mengulang game yang sudah selesai
   - Leaderboard hanya menampilkan peserta yang menyelesaikan 3 game

4. **Tie-break**
   1. Total skor tertinggi
   2. Rata-rata akurasi tertinggi
   3. Waktu penyelesaian tercepat

#### Tombol

- "Mulai Bermain" → `/play/reflex` (jika sudah terdaftar)
- "Kembali" → `/` (jika belum terdaftar)

#### Checklist Fase 4

- [ ] Konten lengkap dan jelas
- [ ] Tombol kondisional berdasarkan status registrasi
- [ ] Responsive di mobile

---

### Fase 5: Reflex Rush Gameplay (1.5 hari)

**Tujuan:** Implementasi gameplay Reflex Rush yang menyenangkan dan terintegrasi backend.

#### Spesifikasi game

- **Durasi:** 40 detik
- **Ronde:** 20 target
- **Skor:** Target berhasil +10, Jebakan -5, Skor minimal 0, maksimal 200

#### Elemen UI

1. **Header**
   - Nama game: "Reflex Rush"
   - Timer countdown
   - Skor real-time

2. **Arena bermain**
   - Area 600×400 px (atau responsive)
   - Target muncul random (warna merah)
   - Jebakan muncul random (warna abu-abu)

3. **Progress bar**
   - Ronde keberapa dari 20

4. **Combo indicator** (opsional)
   - Menunjukkan streak klik benar berturut-turut

5. **Feedback visual**
   - +10 saat klik target
   - -5 saat klik jebakan
   - Animasi singkat

#### State management

```javascript
const [gameState, setGameState] = useState({
  status: 'ready', // ready, countdown, playing, paused, finished
  score: 0,
  round: 0,
  targetsHit: 0,
  targetsMissed: 0,
  trapsHit: 0,
  startTime: null,
  endTime: null
});
```

#### Alur game

1. **Ready state**
   - Tampilkan instruksi
   - Tombol "Mulai"

2. **Countdown** (3 detik)
   - Hitung mundur 3-2-1

3. **Playing state**
   - Timer mulai dari 40 detik
   - Target dan jebakan muncul random
   - Update skor setiap klik
   - Cek apakah waktu habis atau 20 ronde selesai

4. **Finished state**
   - Tampilkan skor akhir
   - Tombol "Lanjutkan ke Game Berikutnya"
   - Submit hasil ke backend

#### Submit hasil

```javascript
const submitResult = async () => {
  const idempotencyKey = crypto.randomUUID();

  const { data, error } = await supabase.functions.invoke('submit-game-result', {
    body: {
      participant_token: localStorage.getItem('participant_token'),
      game_key: 'reflex',
      idempotency_key: idempotencyKey,
      metrics: {
        targets_hit: gameState.targetsHit,
        targets_missed: gameState.targetsMissed,
        traps_hit: gameState.trapsHit,
        duration_ms: gameState.endTime - gameState.startTime
      }
    }
  });

  if (error) {
    // Handle error, tampilkan tombol retry
    setError('Gagal menyimpan hasil. Silakan coba lagi.');
    setRetryData({ idempotencyKey, metrics: gameState });
  } else {
    // Update status peserta
    localStorage.setItem('reflex_completed', 'true');
    localStorage.setItem('reflex_score', data.score);
    navigate('/play/memory');
  }
};
```

#### Retry logic

- Jika submit gagal, simpan data ke state
- Tampilkan tombol "Coba Lagi"
- Gunakan idempotency key yang sama saat retry

#### Checklist Fase 5

- [ ] Arena bermain responsif
- [ ] Timer akurat
- [ ] Scoring benar
- [ ] Submit hasil ke backend
- [ ] Retry logic bekerja
- [ ] Animasi dan feedback visual
- [ ] Touch-friendly di mobile

---

### Fase 6: Memory Rush Gameplay (1.5 hari)

**Tujuan:** Implementasi gameplay Memory Rush dengan pola warna.

#### Spesifikasi game

- **Ronde:** 8 ronde
- **Kesempatan salah:** 3 nyawa
- **Skor:** Ronde benar +25, maksimal 200

#### Elemen UI

1. **Header**
   - Nama game: "Memory Rush"
   - Ronde keberapa (1/8)
   - Nyawa tersisa (3 hati)
   - Skor

2. **Area pola**
   - Grid 3×3 atau 4×4 tombol warna
   - Pola ditampilkan secara berurutan

3. **Progress bar**
   - Ronde keberapa dari 8

4. **Feedback visual**
   - Hijau untuk benar
   - Merah untuk salah

#### State management

```javascript
const [gameState, setGameState] = useState({
  status: 'showing_pattern', // showing_pattern, awaiting_input, correct, incorrect, finished
  round: 1,
  lives: 3,
  score: 0,
  pattern: [], // array of color indices
  playerInput: [],
  showIndex: 0 // index yang sedang ditampilkan
});
```

#### Alur game

1. **Round start**
   - Generate pola untuk ronde tersebut
   - Ronde 1: 3 warna
   - Ronde 2: 4 warna
   - ... bertambah 1 setiap ronde

2. **Showing pattern**
   - Tampilkan warna satu per satu dengan delay
   - Highlight tombol yang sesuai

3. **Awaiting input**
   - Player mengklik tombol sesuai urutan
   - Validasi setiap klik

4. **Correct/Incorrect**
   - Jika benar semua: skor +25, lanjut ronde berikutnya
   - Jika salah: nyawa -1
     - Jika nyawa > 0: ulangi ronde
     - Jika nyawa = 0: game selesai

5. **Finished**
   - Jika 8 ronde selesai atau nyawa habis
   - Submit hasil ke backend

#### Submit hasil

```javascript
const submitResult = async () => {
  const idempotencyKey = crypto.randomUUID();

  const { data, error } = await supabase.functions.invoke('submit-game-result', {
    body: {
      participant_token: localStorage.getItem('participant_token'),
      game_key: 'memory',
      idempotency_key: idempotencyKey,
      metrics: {
        rounds_completed: gameState.round,
        rounds_correct: Math.floor(gameState.score / 25),
        mistakes: 3 - gameState.lives,
        duration_ms: totalDuration
      }
    }
  });

  // Handle response sama seperti Reflex Rush
};
```

#### Checklist Fase 6

- [ ] Pola generate dengan benar
- [ ] Animasi show pattern smooth
- [ ] Input validation real-time
- [ ] Nyawa dan game over logic
- [ ] Submit hasil ke backend
- [ ] Retry logic bekerja
- [ ] Responsive di mobile

---

### Fase 7: Quiz Blitz Gameplay (1.5 hari)

**Tujuan:** Implementasi gameplay Quiz Blitz dengan soal dari backend.

#### Spesifikasi game

- **Jumlah soal:** 10
- **Waktu per soal:** 10 detik
- **Skor:** Jawaban benar +20, maksimal 200

#### Elemen UI

1. **Header**
   - Nama game: "Quiz Blitz"
   - Soal keberapa (1/10)
   - Timer per soal

2. **Kartu pertanyaan**
   - Teks pertanyaan
   - 4 opsi jawaban (A, B, C, D)

3. **Progress bar**
   - Soal keberapa dari 10

4. **Feedback**
   - Hijau untuk benar
   - Merah untuk salah + tampilkan jawaban benar

#### Data dari backend

```javascript
const startQuiz = async () => {
  const { data, error } = await supabase.functions.invoke('start-game', {
    body: {
      participant_token: localStorage.getItem('participant_token'),
      game_key: 'quiz'
    }
  });

  // data.questions = [{ id, question, options }, ...]
  // TIDAK ADA correct_option_index
  setQuestions(data.questions);
  setSessionId(data.session_id);
};
```

#### State management

```javascript
const [gameState, setGameState] = useState({
  status: 'ready', // ready, playing, answering, finished
  currentQuestion: 0,
  questions: [],
  answers: [], // [{ question_id, selected_index, response_time_ms }]
  score: 0,
  startTime: null
});
```

#### Alur game

1. **Start**
   - Fetch soal dari backend
   - Jawaban benar TIDAK dikirim ke client

2. **Playing**
   - Tampilkan soal satu per satu
   - Timer 10 detik per soal

3. **Answering**
   - Player klik opsi
   - Kirim jawaban ke array
   - Tidak ada feedback benar/salah dulu (atau optional)

4. **Finished**
   - Setelah 10 soal selesai
   - Submit semua jawaban ke backend untuk validasi

#### Submit hasil

```javascript
const submitResult = async () => {
  const idempotencyKey = crypto.randomUUID();

  const { data, error } = await supabase.functions.invoke('submit-game-result', {
    body: {
      participant_token: localStorage.getItem('participant_token'),
      game_key: 'quiz',
      idempotency_key: idempotencyKey,
      answers: gameState.answers
    }
  });

  // data.score = total skor dari validasi server
  // data.accuracy = persentase benar
};
```

#### Penting: Validasi di server

- Jawaban dinilai di backend
- Jawaban benar TIDAK PERNAH dikirim ke client sebelum submit
- Skor dihitung server-side

#### Checklist Fase 7

- [ ] Fetch soal dari backend
- [ ] Timer per soal
- [ ] Input validation
- [ ] Submit jawaban ke backend
- [ ] Tidak ada jawaban benar yang bocor ke client
- [ ] Retry logic bekerja
- [ ] Responsive di mobile

---

### Fase 8: Hasil Akhir & Leaderboard Publik (1 hari)

**Tujuan:** Menampilkan hasil akhir peserta dan leaderboard publik.

#### Halaman Hasil Akhir

**Elemen:**

1. **Status**
   - "Selamat! Anda telah menyelesaikan kompetisi."

2. **Identitas**
   - Nama tampilan: "Ahmad_01_IXA"

3. **Skor per game**
   - Reflex Rush: 180
   - Memory Rush: 200
   - Quiz Blitz: 180

4. **Total skor**
   - Total: 560 / 600

5. **Statistik**
   - Rata-rata akurasi: 93.3%
   - Waktu total: 5 menit 23 detik

6. **Peringkat sementara**
   - "Anda saat ini di peringkat 5"

7. **Tombol**
   - "Lihat Leaderboard" → `/leaderboard`
   - "Main Lagi" (disabled jika tidak diizinkan)

#### Data dari backend

```javascript
const fetchResult = async () => {
  const { data, error } = await supabase.functions.invoke('get-progress', {
    body: {
      token: localStorage.getItem('participant_token')
    }
  });

  // data = { participant_id, display_name, status, games: { reflex, memory, quiz } }
};
```

#### Leaderboard Publik

**Elemen:**

1. **Header**
   - "Leaderboard SCC Game Arena"

2. **Top 3 podium**
   - Highlight dengan medali (🥇🥈🥉)

3. **Tabel peserta lainnya**
   - Peringkat, Nama, Kelas, Total Skor

4. **Waktu update**
   - "Terakhir diperbarui: 10:35:00"

#### Data dari backend

```javascript
const { data, error } = await supabase.functions.invoke('get-public-leaderboard');
```

#### Checklist Fase 8

- [ ] Halaman hasil akhir lengkap
- [ ] Leaderboard dengan top 3 podium
- [ ] Tabel peserta dengan pagination (jika perlu)
- [ ] Auto-refresh leaderboard (setiap 10 detik atau manual)
- [ ] Responsive di mobile

---

### Fase 9: State Management & Error Handling (0.5 hari)

**Tujuan:** Memastikan progres tidak hilang dan error ditangani dengan baik.

#### Session persistence

```javascript
// Saat load halaman
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

const fetchProgress = async (token) => {
  const { data, error } = await supabase.functions.invoke('get-progress', {
    body: { token }
  });

  if (error) {
    // Token invalid atau expired
    localStorage.clear();
    navigate('/register');
    return;
  }

  // Update state berdasarkan progress
  if (data.status === 'completed') {
    navigate('/result');
  } else if (data.status === 'playing_memory') {
    navigate('/play/memory');
  }
  // ... dan seterusnya
};
```

#### Error boundaries

```javascript
// ErrorBoundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error ke monitoring
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
```

#### Offline handling

```javascript
// Deteksi offline
useEffect(() => {
  const handleOffline = () => {
    showToast('Koneksi terputus. Progres Anda disimpan secara lokal.', 'warning');
  };

  const handleOnline = () => {
    showToast('Koneksi kembali. Menyinkronkan progres...', 'success');
    // Retry pending submissions
  };

  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);

  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}, []);
```

#### Checklist Fase 9

- [ ] Session persistence bekerja
- [ ] Refresh halaman mempertahankan progres
- [ ] Error boundary menangani crash
- [ ] Offline/online detection
- [ ] Toast notification untuk error dan info

---

## 7. Kontrak Integrasi dengan Backend

### Endpoint yang digunakan

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `register-participant` | POST | `{ full_name, attendance_number, class_name }` | `{ success, participant_id, token, display_name }` |
| `get-progress` | POST | `{ token }` | `{ participant_id, display_name, status, games }` |
| `start-game` | POST | `{ participant_token, game_key }` | `{ session_id, questions? }` |
| `submit-game-result` | POST | `{ participant_token, game_key, idempotency_key, metrics/answers }` | `{ success, score, accuracy, completed_at }` |
| `get-public-leaderboard` | GET | - | `{ leaderboard: [...], updated_at }` |

### Token management

- Token disimpan di `localStorage` dengan key `participant_token`
- Token dikirim dengan setiap request yang memerlukan autentikasi peserta
- Jika token invalid, redirect ke `/register` dengan pesan yang jelas

### Idempotency

- Setiap submit game menghasilkan `idempotency_key` (UUID v4)
- Jika request gagal, gunakan key yang sama untuk retry
- Key disimpan di state React, bukan localStorage

---

## 8. Persyaratan UI/UX

### Responsiveness

- Target utama: desktop 1440×900 px
- Target sekunder: mobile 375×667 px
- Touch-friendly: tombol minimal 44×44 px

### Accessibility

- [ ] Kontras teks minimal WCAG AA
- [ ] Semua tombol dapat diakses keyboard
- [ ] Focus ring yang jelas
- [ ] Label pada semua input
- [ ] `aria-live` untuk perubahan skor dan timer
- [ ] `prefers-reduced-motion` dihormati

### Animasi

- Hover button: 150-200ms
- Feedback skor: fade dan translate pendek
- Perpindahan ronde: fade
- Toast: slide pendek

---

## 9. Acceptance Criteria

### Fungsional

- [ ] Peserta dapat mendaftar dengan validasi ketat
- [ ] Peserta dapat melihat aturan kompetisi
- [ ] Peserta dapat memainkan 3 game secara berurutan
- [ ] Skor dihitung dengan benar di client dan divalidasi server
- [ ] Progres tersimpan dan dapat dilanjutkan setelah refresh
- [ ] Peserta dapat melihat hasil akhir dan leaderboard

### Non-fungsional

- [ ] Halaman load dalam < 3 detik
- [ ] Game berjalan smooth 60fps
- [ ] Tidak ada crash pada penggunaan normal
- [ ] Error message informatif
- [ ] UI responsif di desktop dan mobile

---

## 10. Definisi Selesai

- [ ] Semua halaman publik berfungsi penuh
- [ ] Terintegrasi dengan backend
- [ ] Testing manual di desktop dan mobile
- [ ] Tidak ada bug kritis
- [ ] Code review selesai
- [ ] Merge ke main branch

---

## 11. Risiko dan Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Backend belum siap | Gunakan mock data untuk development, koordinasi intensif dengan Kiandra |
| Game terlalu berat | Optimasi render, gunakan requestAnimationFrame, minimalisir DOM manipulation |
| Browser tidak support | Target browser modern (Chrome, Firefox, Safari, Edge) |
| Touch event tidak akurat | Test di device nyata, gunakan pointer events |

---

## 12. Urutan Rekomendasi

1. **Fase 1** — Setup & integrasi Supabase
2. **Fase 2** — Landing page
3. **Fase 3** — Registrasi
4. **Fase 4** — Aturan kompetisi
5. **Fase 5** — Reflex Rush
6. **Fase 6** — Memory Rush
7. **Fase 7** — Quiz Blitz
8. **Fase 8** — Hasil & Leaderboard
9. **Fase 9** — State management & error handling

---

## 13. File yang Dibuat/Dimodifikasi

### Dimodifikasi

```
src/
├── lib/
│   ├── supabase.js           — Konfigurasi client
│   └── env.js                — Environment variables
├── pages/public/
│   ├── LandingPage.jsx       — Hero, stats, leaderboard preview
│   ├── RegisterPage.jsx      — Form registrasi terintegrasi backend
│   ├── RulesPage.jsx         — Konten aturan
│   ├── ReflexRushPage.jsx    — Gameplay lengkap
│   ├── MemoryRushPage.jsx    — Gameplay lengkap
│   ├── QuizBlitzPage.jsx     — Gameplay lengkap
│   ├── ResultPage.jsx        — Hasil akhir
│   └── LeaderboardPage.jsx   — Leaderboard publik
├── components/game/
│   ├── GameShell.jsx         — Wrapper untuk game pages
│   ├── GameTimer.jsx         — Timer component
│   └── ScoreDisplay.jsx      — Skor display
├── hooks/
│   ├── useGameSession.js     — Game session management
│   ├── useCountdown.js       — Timer hook
│   └── useLeaderboard.js     — Leaderboard fetch hook
└── utils/
    └── gameLogic.js          — Helper functions untuk game logic
```

### Baru (opsional)

```
src/
├── components/ui/
│   ├── Toast.jsx             — Toast notification
│   ├── Modal.jsx             — Modal dialog
│   └── Skeleton.jsx          — Loading skeleton
└── context/
    └── SessionContext.jsx    — Session state management
```

---

## 14. Catatan Tambahan

- Koordinasi intensif dengan Kiandra untuk backend API
- Test di device nyata untuk touch events
- Gunakan React DevTools untuk debugging
- Performance profiling dengan Chrome DevTools
- Dokumentasikan semua bug dan solusi
