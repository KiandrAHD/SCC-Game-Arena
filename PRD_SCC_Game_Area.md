# Product Requirements Document (PRD)

## SCC Game Arena

**Versi dokumen:** 1.0  
**Status:** Draft untuk implementasi MVP  
**Bahasa:** Indonesia  
**Kegiatan:** Stematel Creative Challenge (SCC) 2026  
**Sekolah tujuan:** SMP Negeri 1 Karangpucung  
**Platform:** Website responsif, dengan prioritas perangkat seluler

---

## 1. Ringkasan Produk

SCC Game Arena adalah website mini-game berbasis browser yang dibuat sebagai produk kejuruan untuk kegiatan Stematel Creative Challenge (SCC) SMK Telkom Purwokerto. Website memungkinkan siswa SMP mengikuti satu kompetisi yang terdiri dari tiga game singkat, mendapatkan skor total, dan melihat papan peringkat.

Siswa tidak perlu mengunduh aplikasi atau membuat akun. Peserta mengisi nama, nomor absen, dan kelas, lalu memainkan tiga game secara berurutan. Admin menggunakan dashboard terproteksi untuk melihat peserta, memantau progres, memeriksa hasil, mengelola status kompetisi, dan mengekspor hasil.

Produk dirancang dengan antarmuka minimalis, ringan, mudah digunakan melalui HP, dan mampu melayani target hingga 96 pengguna aktif secara bersamaan. Angka kapasitas tersebut adalah target pengujian, bukan jaminan sebelum load test dilakukan.

## 2. Latar Belakang

Dalam kegiatan SCC, kelompok siswa SMK mendemonstrasikan karya atau produk kejuruan, berbagi pengalaman belajar, dan menyiapkan aktivitas game atau kuis untuk siswa SMP. SCC Game Arena menjadi produk yang bisa didemonstrasikan sekaligus digunakan dalam sesi fun game.

Fokus produk adalah membuat pengalaman kompetisi yang sederhana dan menyenangkan, dengan proses masuk yang singkat serta perhitungan hasil yang konsisten. Website harus dapat berjalan di HP dengan koneksi internet yang bervariasi dan tidak boleh mengharuskan server menangani setiap interaksi visual permainan.

## 3. Tujuan Produk

1. Memberikan pengalaman bermain tiga mini-game yang mudah dipahami oleh siswa kelas IX.
2. Menyelenggarakan satu kompetisi dengan total skor dari ketiga game.
3. Menentukan tiga peserta dengan peringkat tertinggi melalui aturan penilaian yang transparan.
4. Menyediakan dashboard agar admin dapat melihat data dan hasil kompetisi tanpa mengakses database secara manual.
5. Menunjukkan proses pembuatan produk web interaktif sebagai bagian dari demonstrasi karya kejuruan SCC.
6. Mempertahankan pengalaman yang responsif pada HP dan meminimalkan request backend yang tidak diperlukan.

## 4. Sasaran dan Indikator Keberhasilan

### 4.1 Sasaran

- Siswa SMP, terutama kelas IX, sebagai peserta permainan.
- Admin/panitia kelompok SCC sebagai pengelola kompetisi.
- Anggota kelompok SCC sebagai pengembang dan operator teknis.

### 4.2 Indikator keberhasilan

- Peserta dapat mendaftar dengan nama, nomor absen, dan kelas tanpa membuat akun.
- Peserta dapat menyelesaikan ketiga game secara berurutan.
- Setiap game memiliki skor valid pada rentang 0–200; total skor kompetisi berada pada rentang 0–600.
- Hasil yang telah dikonfirmasi tersimpan tetap di database dan tidak hilang ketika halaman dimuat ulang.
- Pendaftaran identik dan hasil resmi ganda ditolak oleh database/backend.
- Admin dapat melihat peserta, skor, progres, leaderboard, serta mengunduh hasil CSV.
- Leaderboard hanya memasukkan peserta yang memiliki tiga hasil game valid.
- Website dapat melewati load test bertahap hingga 96 pengguna virtual aktif dengan target kualitas pada Bagian 12.
- Website lolos uji penggunaan di beberapa HP dan uji simulasi di lokasi kegiatan sebelum hari SCC.

## 5. Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Ikon | Lucide |
| Animasi | CSS animations / transisi sederhana |
| Logika game | JavaScript |
| Backend dan database | Supabase, termasuk PostgreSQL dan Edge Functions untuk endpoint yang memerlukan validasi server |
| Autentikasi admin | Supabase Auth |
| Hosting frontend | Vercel |
| Version control | GitHub |

**Catatan:** Logika interaksi dan animasi game dijalankan di browser. Validasi dan penyimpanan hasil resmi dilakukan di backend. Karena JavaScript berjalan di sisi klien, skor yang dikirim browser tidak boleh dipercaya begitu saja.

## 6. Pengguna dan Hak Akses

### 6.1 Peserta

Peserta dapat:
- Membuka halaman utama.
- Mendaftarkan nama, nomor absen, dan kelas.
- Melihat petunjuk dan aturan kompetisi.
- Memainkan tiga game sesuai urutan.
- Melihat hasil pribadinya setelah kompetisi selesai.
- Melihat leaderboard publik.
- Melanjutkan progres jika halaman tidak sengaja tertutup, menggunakan token sesi yang dikelola website.

Peserta tidak dapat:
- Membuka dashboard admin.
- Mengubah hasil resmi yang sudah tersimpan.
- Mengakses data internal peserta lain atau informasi rahasia backend.
- Mengirim hasil resmi berulang untuk game yang sama.

### 6.2 Admin

Admin harus login. Admin dapat:
- Melihat ringkasan jumlah peserta dan progres.
- Melihat detail peserta dan hasil setiap game.
- Melihat leaderboard yang dihitung dari hasil valid.
- Membuka atau menutup pendaftaran/kompetisi.
- Mengekspor data peserta dan hasil ke CSV.

Admin tidak boleh memiliki kredensial atau secret yang tertanam dalam kode frontend. Perubahan data penting perlu dibatasi pada endpoint admin atau akses database yang telah diamankan.

## 7. Ruang Lingkup MVP

### 7.1 Termasuk dalam MVP

- Landing page dan petunjuk kompetisi.
- Form identitas peserta: nama lengkap, nomor absen, dan kelas.
- Registrasi tanpa akun siswa dan tanpa kode sesi yang perlu diketik.
- Tiga game berurutan: Reflex Rush, Memory Rush, dan Quiz Blitz.
- Timer, skor, progres game, layar hasil, dan total skor.
- Penyimpanan progres dan hasil resmi ke Supabase.
- Leaderboard peserta yang menyelesaikan tiga game.
- Login admin, dashboard, daftar peserta, leaderboard admin, dan ekspor CSV.
- Pengaturan status kompetisi: `draft`, `open`, dan `closed`.
- Penanganan request gagal dan pengiriman ulang hasil secara idempotent.
- Layout responsif dan performa yang diuji di HP.

### 7.2 Tidak termasuk dalam MVP

- Akun atau kata sandi untuk peserta.
- Multiplayer real-time atau kompetisi antarpemain dalam satu layar.
- Chat, profil/avatar khusus, inventaris, toko hadiah, atau mata uang virtual.
- Sistem level jangka panjang dan achievement kompleks.
- Animasi 3D atau aset besar yang tidak diperlukan.
- Aplikasi Android/iOS native.
- Sistem anti-cheat tingkat turnamen profesional.

## 8. Alur Utama Peserta

1. Peserta membuka `/`.
2. Peserta memilih **Mulai Bermain**.
3. Peserta mengisi nama lengkap, nomor absen, kelas, dan menyetujui aturan kompetisi.
4. Backend memeriksa apakah kompetisi menerima pendaftaran dan apakah identitas sudah terdaftar.
5. Setelah pendaftaran berhasil, website menyimpan token sesi peserta secara aman di perangkat dan menampilkan petunjuk kompetisi.
6. Peserta memainkan Reflex Rush.
7. Hasil game dikirim dan harus mendapat konfirmasi sukses dari server sebelum peserta dianggap selesai pada game tersebut.
8. Peserta memainkan Memory Rush, kemudian Quiz Blitz dengan proses penyimpanan yang sama.
9. Jika tiga hasil telah tervalidasi, website menampilkan skor setiap game dan total skor.
10. Peserta dapat membuka leaderboard.

Jika halaman ditutup atau dimuat ulang, website memeriksa sesi yang sudah ada dan meminta progres terbaru dari backend. Website tidak boleh membuat pendaftaran baru secara otomatis jika peserta sebenarnya memiliki sesi yang masih berlaku.

## 9. Identitas Peserta dan Aturan Registrasi

### 9.1 Kolom form

| Kolom | Aturan |
|---|---|
| Nama lengkap | Wajib, 1–40 karakter setelah spasi awal/akhir dibersihkan |
| Nomor absen | Wajib, bilangan bulat positif dalam rentang yang disepakati dengan SMP |
| Kelas | Wajib, dipilih dari daftar kelas yang dikonfigurasi |
| Persetujuan aturan | Wajib sebelum kompetisi dimulai |

Contoh tampilan identitas: `Ahmad_01_IXA`. Nama, nomor absen, dan kelas disimpan sebagai kolom terpisah; format gabungan hanya digunakan untuk tampilan.

### 9.2 Pencegahan duplikasi

- Satu kombinasi event, kelas, dan nomor absen hanya boleh mempunyai satu pendaftaran resmi.
- Backend dan database wajib menerapkan validasi/constraint unik, bukan hanya pemeriksaan pada UI.
- Jika identitas telah terdaftar, website menampilkan instruksi untuk melanjutkan sesi atau meminta bantuan panitia, bukan membuat peserta kedua.
- Karena peserta tidak login dan tidak memakai kode akses yang diketik, identitas yang dimasukkan tidak membuktikan identitas nyata. Jika tersedia, panitia dianjurkan menggunakan daftar kelas/absen resmi untuk memeriksa ketidaksesuaian.

## 10. Spesifikasi Game dan Scoring

Setiap peserta memainkan ketiga game dalam urutan yang sama. Batas skor tiap game adalah 200 dan total maksimal adalah 600. Aturan berikut menjadi rancangan awal dan harus diuji sebelum kompetisi; aturan tidak boleh diubah saat kompetisi sedang berjalan.

### 10.1 Game 1 — Reflex Rush

**Tujuan:** Menguji refleks dan ketepatan pemain.

**Mekanisme:**
- Durasi target 40 detik.
- Terdapat 20 ronde/target.
- Target dan objek jebakan ditampilkan dalam antarmuka.
- Pemain menyentuh target yang benar dan menghindari objek jebakan.

**Skor:**
- Target berhasil disentuh: `+10`.
- Target terlewat: `0`.
- Objek jebakan disentuh: `-5`.
- Skor akhir dibatasi pada rentang `0–200`.
- Skor maksimum dasar adalah `20 × 10 = 200` sebelum penalti.

**Data hasil minimum:** jumlah target berhasil, jumlah target terlewat, jumlah jebakan yang disentuh, durasi, dan skor hasil validasi server.

### 10.2 Game 2 — Memory Rush

**Tujuan:** Menguji memori dan konsentrasi.

**Mekanisme:**
- Terdapat 8 ronde.
- Setiap ronde menampilkan urutan warna atau simbol yang harus diingat dan diulangi.
- Panjang/pola urutan meningkat sesuai tingkat ronde.
- Pemain memiliki 3 kesempatan salah; setelah kesalahan ketiga, game berakhir.
- Setiap ronde hanya bisa dinilai satu kali.

**Skor:**
- Ronde benar: `+25`.
- Ronde salah: `0` dan mengurangi satu nyawa.
- Skor maksimum `8 × 25 = 200`.
- Skor akhir dibatasi pada rentang `0–200`.

**Data hasil minimum:** jumlah ronde benar, ronde yang dicoba, jumlah kesalahan, durasi, dan skor hasil validasi server.

### 10.3 Game 3 — Quiz Blitz

**Tujuan:** Menguji pengetahuan umum, logika, teknologi, dan internet.

**Mekanisme:**
- Terdapat 10 pertanyaan pilihan ganda.
- Waktu target menjawab sekitar 10 detik per pertanyaan.
- Tidak ada bonus kecepatan agar peserta tidak dirugikan hanya karena membaca lebih hati-hati.
- Jawaban yang benar tidak dikirim ke browser sebelum jawaban peserta dinilai.

**Skor:**
- Jawaban benar: `+20`.
- Jawaban salah atau waktu habis: `0`.
- Skor maksimum `10 × 20 = 200`.
- Skor akhir dibatasi pada rentang `0–200`.

**Data hasil minimum:** jumlah jawaban benar, jumlah soal terjawab, durasi, dan skor hasil validasi server.

### 10.4 Total skor dan leaderboard

`total_score = reflex_score + memory_score + quiz_score`

- Total minimum: `0`.
- Total maksimum: `600`.
- Peserta hanya masuk leaderboard final jika mempunyai tiga hasil game resmi yang valid.
- Peserta yang baru menyelesaikan satu atau dua game tetap terlihat di dashboard admin sebagai belum selesai, tetapi tidak masuk leaderboard final.

### 10.5 Aturan tie-break

Urutan peringkat:
1. Total skor lebih tinggi.
2. Jika total skor sama, rata-rata akurasi tiga game lebih tinggi.
3. Jika masih sama, waktu penyelesaian kompetisi paling awal berdasarkan timestamp server saat hasil game ketiga berhasil disimpan.

Definisi akurasi:
- Reflex Rush: target berhasil disentuh dibagi total target, dikalikan 100.
- Memory Rush: ronde benar dibagi 8, dikalikan 100.
- Quiz Blitz: jawaban benar dibagi 10, dikalikan 100.

Rata-rata akurasi kompetisi adalah rata-rata sederhana dari ketiga persentase tersebut. Definisi ini harus diterapkan konsisten pada seluruh peserta.

## 11. Struktur Halaman dan Route

| Route | Halaman | Tujuan |
|---|---|---|
| `/` | Landing page | Informasi singkat dan tombol mulai |
| `/register` | Identitas peserta | Form nama, absen, kelas |
| `/rules` | Aturan kompetisi | Instruksi, urutan game, dan scoring |
| `/play/reflex` | Reflex Rush | Game pertama |
| `/play/memory` | Memory Rush | Game kedua |
| `/play/quiz` | Quiz Blitz | Game ketiga |
| `/result` | Hasil akhir | Rincian skor dan total |
| `/leaderboard` | Leaderboard publik | Peringkat peserta yang selesai |
| `/admin/login` | Login admin | Autentikasi admin |
| `/admin` | Dashboard admin | Ringkasan event dan peserta |
| `/admin/participants` | Peserta | Identitas, progres, dan hasil per game |
| `/admin/leaderboard` | Hasil kompetisi | Peringkat dan ekspor CSV |
| `/admin/settings` | Pengaturan | Status pendaftaran/kompetisi |

Route admin bukan mekanisme keamanan dengan sendirinya. Semua operasi dan data admin harus tetap dilindungi oleh autentikasi serta kebijakan backend/database.

## 12. Persyaratan Performa dan Kapasitas

### 12.1 Target penggunaan

- Total peserta terdaftar yang direncanakan: hingga 300.
- Target pengguna aktif bersamaan: 32–96.
- Perangkat utama: HP melalui browser modern.
- Koneksi dapat bervariasi sesuai kondisi jaringan sekolah.

Target ini adalah kebutuhan pengujian, bukan jaminan kapasitas bawaan penyedia layanan.

### 12.2 Prinsip performa

- Timer, animasi, interaksi sentuh, dan skor sementara berjalan di browser.
- Jangan mengirim request backend untuk setiap sentuhan atau perubahan animasi.
- Kirim jawaban/log relevan secara batch pada akhir game, lalu validasi di server.
- Ambil data yang diperlukan saja; hindari memuat semua data peserta di halaman publik.
- Gunakan indeks untuk query yang sering digunakan dan constraint unik untuk mencegah data ganda.
- Gunakan CDN Vercel untuk aset frontend.
- Tampilkan status simpan/loading/error yang jelas.
- Terapkan retry aman untuk pengiriman hasil; retry tidak boleh membuat skor ganda.
- Leaderboard admin dapat diperbarui berkala sekitar setiap 10 detik; hindari polling per detik jika tidak dibutuhkan.
- Supabase Realtime bukan kebutuhan MVP.

### 12.3 Target load test awal

Lakukan pengujian bertahap pada staging atau event uji: 10, 32, 64, lalu 96 pengguna virtual, disertai spike test untuk pendaftaran atau submit yang terjadi berdekatan.

Target penerimaan awal:
- API penting: p95 kurang dari 1,5 detik pada skenario uji yang ditentukan.
- Error rate request penting kurang dari 1%.
- Tidak ada hasil ganda dari request berulang.
- Tidak ada total skor yang tidak cocok dengan tiga skor per game.
- Tidak ada hasil yang hilang setelah server mengonfirmasi penyimpanan berhasil.

Angka tersebut merupakan target proyek yang perlu diverifikasi melalui load test; bukan SLA resmi dari Vercel atau Supabase. Uji load perlu dilengkapi uji nyata di HP dan uji koneksi di lokasi SCC.

## 13. Model Data Awal

### 13.1 `events`

Menyimpan informasi kompetisi.
- `id`: UUID, primary key.
- `name`: nama event.
- `status`: `draft`, `open`, atau `closed`.
- `created_at`: timestamp server.
- `created_by`: ID admin pembuat.

### 13.2 `participants`

Menyimpan identitas peserta.
- `id`: UUID, primary key.
- `event_id`: foreign key ke `events`.
- `full_name`: nama peserta.
- `attendance_number`: nomor absen.
- `class_name`: kelas.
- `entry_token_hash`: hash token sesi, bukan token asli.
- `created_at`: timestamp server.
- Constraint unik: `(event_id, class_name, attendance_number)`.

Token asli dikelola di perangkat peserta dan tidak ditampilkan di URL atau leaderboard. Token hanya dipakai untuk melanjutkan sesi. Mekanisme pembuatannya harus menggunakan entropi kriptografis yang memadai; jangan menggunakan ID peserta sebagai token.

### 13.3 `game_sessions`

Menyimpan sesi game dan status pemrosesan.
- `id`: UUID, primary key.
- `participant_id`: foreign key ke `participants`.
- `game_key`: `reflex`, `memory`, atau `quiz`.
- `status`: `started`, `submitted`, atau `validated`.
- `started_at`: timestamp server.
- `completed_at`: timestamp server, nullable.
- `challenge_metadata`: metadata tantangan yang diperlukan untuk validasi.
- Constraint unik untuk sesi resmi peserta/game sesuai model satu percobaan resmi.

### 13.4 `game_results`

Menyimpan hasil final game.
- `id`: UUID, primary key.
- `participant_id`: foreign key ke `participants`.
- `game_key`: `reflex`, `memory`, atau `quiz`.
- `score`: integer, 0–200.
- `accuracy`: angka 0–100.
- `duration_ms`: durasi yang dicatat/validasi sistem.
- `metrics`: JSONB berisi statistik relevan, bukan data pribadi tambahan.
- `completed_at`: timestamp server.
- Constraint unik: `(participant_id, game_key)`.

Hasil final harus dibuat secara atomik melalui backend. Pengiriman ulang permintaan yang sama tidak boleh menggandakan hasil.

### 13.5 `quiz_questions`

Menyimpan soal Quiz Blitz.
- `id`: UUID, primary key.
- `event_id`: foreign key ke `events`.
- `question`: teks pertanyaan.
- `options`: pilihan jawaban.
- `correct_option_index`: jawaban benar, hanya tersedia untuk backend/admin.
- `is_active`: status soal.

Jawaban benar tidak boleh dimasukkan ke payload publik sebelum jawaban peserta dinilai.

### 13.6 `admin_users`

Menghubungkan akun Supabase Auth dengan peran admin. MVP cukup memerlukan peran `admin`.

### 13.7 Agregasi leaderboard

Leaderboard menghitung total hanya dari peserta yang mempunyai ketiga hasil valid. Hasil akhir tidak sebaiknya diubah secara bebas dari browser. Jika total disimpan secara denormalisasi untuk performa, nilainya harus diperbarui secara konsisten oleh backend/database dan dapat dibandingkan dengan rincian tiga game.

## 14. API / Operasi Backend yang Dibutuhkan

Nama operasi di bawah adalah rancangan kontrak, bukan keharusan nama endpoint akhir.

| Operasi | Akses | Tanggung jawab |
|---|---|---|
| `register-participant` | Publik, dibatasi dan divalidasi | Memeriksa event terbuka, memvalidasi identitas, menolak duplikasi, membuat peserta dan token sesi |
| `get-progress` | Token sesi peserta | Mengembalikan progres sesi peserta yang bersangkutan |
| `start-game` | Token sesi peserta | Membuka sesi game dan memberikan tantangan yang dibutuhkan |
| `submit-game-result` | Token sesi peserta | Memvalidasi sesi dan data hasil, menghitung skor di server, menyimpan satu hasil resmi |
| `get-public-leaderboard` | Publik | Mengembalikan data peringkat minimal yang aman untuk ditampilkan |
| Operasi admin | Admin terautentikasi | Mengelola event, melihat data peserta/hasil, mengubah status, dan ekspor CSV |

Semua endpoint perlu menangani input tidak valid, request berulang, status event yang tertutup, token tidak valid, dan kegagalan database dengan respons yang konsisten.

## 15. Keamanan, Privasi, dan Integritas Hasil

- Aktifkan Row Level Security (RLS) untuk tabel yang diakses melalui Supabase API.
- Jangan menaruh `service_role` key atau secret server dalam kode frontend, repository publik, atau variabel `VITE_*`.
- Kunci publik Supabase hanya boleh digunakan bersama RLS dan kebijakan akses yang tepat.
- Operasi penulisan hasil resmi dilakukan melalui fungsi backend tervalidasi, bukan update skor langsung dari browser.
- Verifikasi event, token, game, sesi, batas skor, durasi, jumlah ronde, dan jumlah jawaban di server.
- Quiz Blitz dinilai di server; jawaban yang benar tidak dikirimkan sebelum diperlukan.
- Untuk game refleks, kirim catatan interaksi yang diperlukan dalam satu batch dan validasi batas serta urutannya di server. Karena input berasal dari browser, ini mengurangi tetapi tidak sepenuhnya mencegah kecurangan.
- Gunakan operasi idempotent agar retry tidak membuat hasil ganda.
- Lindungi dashboard admin dengan Supabase Auth dan otorisasi server/database.
- Terapkan pembatasan request dasar pada pendaftaran serta endpoint sensitif.
- Publikasikan hanya data leaderboard yang diperlukan: nama tampilan, kelas bila diperlukan, dan skor. Jangan tampilkan token sesi atau data internal.
- Kumpulkan hanya data yang diperlukan untuk kompetisi. Tidak perlu meminta nomor telepon, alamat, atau informasi pribadi lain untuk MVP.
- Berikan informasi singkat bahwa data dipakai untuk menjalankan dan merekap kompetisi.
- Tentukan masa retensi dan penghapusan data bersama pembimbing/pihak sekolah setelah kebutuhan laporan SCC selesai.

**Batas keamanan:** website MVP bukan sistem anti-cheat tingkat profesional. Pengawasan panitia, daftar peserta bila tersedia, aturan satu percobaan resmi, validasi server, dan audit hasil merupakan lapisan pengamanan bersama.

## 16. Desain dan Aksesibilitas

- Pendekatan mobile-first.
- Visual minimalis, bersih, dan ringan.
- Warna, tipografi, ukuran tombol, dan jarak antarelemen konsisten.
- Tombol besar dan mudah disentuh; hindari interaksi yang hanya bekerja dengan hover.
- Timer, skor, dan progres ronde mudah terlihat.
- Animasi pendek dan tidak menghalangi input.
- Audio tidak wajib untuk memahami permainan.
- Pesan validasi, loading, sukses, dan error harus jelas.
- Gunakan ikon Lucide seperlunya; jangan mengandalkan ikon saja untuk tindakan penting.
- Berikan kontras teks yang memadai serta label pada field form.

## 17. Penanganan Gangguan dan Edge Case

- **Peserta menekan tombol mulai dua kali:** cegah pengiriman pendaftaran ganda melalui status loading dan constraint backend/database.
- **Nomor absen sudah terdaftar:** tawarkan melanjutkan sesi atau meminta bantuan panitia; jangan otomatis mengganti identitas.
- **Halaman game di-refresh:** ambil status sesi dari backend dan lanjutkan sesuai progres tersimpan.
- **Koneksi putus saat bermain:** game boleh meneruskan interaksi lokal jika memungkinkan, tetapi jangan mengklaim hasil tersimpan sebelum server mengonfirmasi.
- **Submit hasil gagal:** simpan payload hasil sementara, tampilkan tombol coba lagi, lalu kirim dengan idempotency key yang sama.
- **Hasil dikirim dua kali:** backend mengembalikan hasil sebelumnya atau menolak duplikasi tanpa menambahkan skor lagi.
- **Kompetisi ditutup saat peserta bermain:** backend tidak menerima sesi baru; kebijakan untuk sesi yang sudah berjalan harus ditetapkan sebelum acara dan diberlakukan konsisten.
- **Peserta tidak menyelesaikan tiga game:** tampilkan status belum selesai pada admin, jangan ikutkan di leaderboard final.
- **Skor sama:** gunakan aturan tie-break yang telah ditetapkan.
- **Admin kehilangan koneksi:** hasil yang sudah tersimpan tetap berada di database; admin dapat membuka kembali dashboard setelah koneksi pulih.
- **Backend sedang tidak tersedia:** tampilkan pesan yang jelas dan jangan menyatakan submit sukses sebelum ada konfirmasi.

## 18. Tahapan Implementasi

### Tahap 1 — Setup dan kerangka UI
- Buat repository GitHub.
- Inisialisasi React + Vite.
- Pasang Tailwind CSS dan Lucide.
- Buat routing serta komponen umum.
- Siapkan seluruh halaman dengan data sementara.

### Tahap 2 — Gameplay lokal
- Implementasikan Reflex Rush.
- Implementasikan Memory Rush.
- Implementasikan Quiz Blitz.
- Buat timer, progres, scoring, serta transisi antargame.
- Uji semua aturan game sebelum menyimpan skor ke backend.

### Tahap 3 — Supabase
- Buat project dan pilih region dekat pengguna, misalnya Singapore, setelah memeriksa ketersediaan.
- Buat migration tabel, constraint, indeks, dan RLS.
- Implementasikan registrasi serta token sesi.
- Implementasikan start/resume game dan pengiriman hasil yang idempotent.
- Validasi scoring dan penyimpanan hasil melalui backend.

### Tahap 4 — Admin dan leaderboard
- Implementasikan login admin.
- Buat dashboard ringkasan, tabel peserta, status progres, hasil, dan leaderboard.
- Buat ekspor CSV.
- Uji hak akses dan kebocoran data.

### Tahap 5 — QA dan deployment
- Uji seluruh alur pada HP nyata.
- Uji refresh, koneksi putus, retry, duplikasi, serta skor seri.
- Lakukan load test bertahap sampai 96 pengguna virtual.
- Perbaiki bottleneck dan error.
- Deploy melalui Vercel dan ulangi smoke test pada domain produksi.
- Lakukan simulasi kompetisi sebelum hari pelaksanaan.

Tanggal dan pembagian waktu tiap tahap perlu disesuaikan dengan progres aktual dan jadwal bimbingan SCC.

## 19. Acceptance Criteria — Syarat MVP Siap Digunakan

### Peserta dan gameplay
- [ ] Peserta dapat mengisi nama, nomor absen, dan kelas.
- [ ] Pendaftaran hanya berhasil saat event menerima peserta.
- [ ] Pendaftaran ganda pada event/kelas/nomor absen yang sama ditolak.
- [ ] Ketiga game dapat dimainkan berurutan dengan input sentuh.
- [ ] Nilai skor sesuai aturan dan batas yang sudah ditentukan.
- [ ] Peserta dapat memulihkan progres setelah refresh.
- [ ] Skor final terlihat setelah tiga game valid tersimpan.

### Backend dan admin
- [ ] Hasil game disimpan di database dan bertahan setelah refresh.
- [ ] Retry tidak menggandakan hasil resmi.
- [ ] Skor tiap game divalidasi server.
- [ ] Total skor selalu sama dengan jumlah tiga hasil yang valid.
- [ ] Leaderboard mengecualikan peserta yang belum selesai.
- [ ] Admin login diperlukan untuk membuka dashboard.
- [ ] Ekspor CSV berisi peserta dan skor yang cocok dengan dashboard.
- [ ] Kebijakan RLS tidak memungkinkan pengunjung anonim membaca atau mengubah data sensitif.

### Performa dan operasional
- [ ] Load test 10, 32, 64, dan 96 pengguna telah dijalankan serta hasilnya dicatat.
- [ ] Target p95 dan error rate pada Bagian 12 telah diuji.
- [ ] Tidak ada hasil ganda atau hasil hilang setelah konfirmasi server sukses.
- [ ] Website telah diuji pada HP dan jaringan yang relevan dengan lokasi SCC.
- [ ] Domain produksi, akun admin, prosedur penutupan kompetisi, dan rencana cadangan siap sebelum acara.

## 20. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Lonjakan akses saat acara dimulai | Load test, CDN untuk aset, endpoint ringkas, dan pembukaan peserta secara terkoordinasi jika perlu |
| Wi-Fi atau internet lokasi bermasalah | Uji jaringan di lokasi, siapkan koneksi cadangan untuk admin, dan dukung retry pengiriman hasil |
| Skor dimanipulasi dari browser | Validasi server, satu hasil per game, token sesi, batas durasi/ronde, dan pengawasan panitia |
| Identitas peserta palsu | Cocokkan dengan daftar resmi jika tersedia; batasi duplikasi di backend/database |
| Secret backend masuk repository | Gunakan environment variables, `.env.example`, dan jangan commit `.env` atau secret |
| Supabase Free tidak aktif atau mencapai batas | Pastikan proyek aktif sebelum acara, pantau penggunaan, dan siapkan keputusan upgrade bila hasil pengujian memerlukannya |
| Satu game terlalu sulit atau mudah | Uji coba pada peserta perwakilan dan bekukan aturan scoring sebelum acara |
| Admin salah membuka/menutup event | Sediakan status jelas dan lakukan simulasi operasional sebelum hari SCC |

## 21. Keputusan yang Masih Perlu Dikonfirmasi

Hal berikut dapat ditetapkan selama implementasi sebelum hari pelaksanaan:

1. Daftar kelas dan rentang nomor absen yang akan diizinkan.
2. Apakah panitia memiliki daftar peserta resmi untuk pencocokan identitas.
3. Nama final website dan teks yang akan digunakan pada landing page.
4. Jumlah admin yang membutuhkan akses dashboard.
5. Kebijakan jika peserta terputus setelah memulai game: apakah dapat melanjutkan sesi atau harus meminta bantuan panitia.
6. Waktu penutupan pendaftaran dan waktu finalisasi leaderboard.
7. Lama penyimpanan data peserta setelah pelaporan SCC selesai.
8. Hasil load test dan keputusan apakah paket layanan yang digunakan cukup untuk beban aktual.

---

## 22. Definisi Selesai

MVP dianggap selesai ketika semua acceptance criteria penting pada Bagian 19 terpenuhi, hasil load test dan uji HP terdokumentasi, admin telah mencoba simulasi kompetisi dari awal hingga ekspor CSV, dan website produksi siap diakses pada hari SCC.
