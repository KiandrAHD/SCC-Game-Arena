-- Seed initial event
insert into public.events (id, name, status, allowed_classes, attendance_min, attendance_max)
values (
  'e0000000-0000-0000-0000-000000000001',
  'SCC Game Arena 2026',
  'open',
  array['IXA', 'IXB', 'IXC', 'IXD', 'IXE', 'IXF', 'IXG', 'IXH'],
  1,
  40
) on conflict (id) do nothing;

-- Seed initial competition settings
insert into public.competition_settings (
  id,
  event_id,
  registration_open,
  replay_allowed,
  reflex_duration_seconds,
  reflex_rounds,
  memory_rounds,
  memory_max_lives,
  quiz_questions_count,
  quiz_time_per_question_seconds
)
values (
  'a0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  true,
  false,
  40,
  20,
  8,
  3,
  10,
  10
) on conflict (event_id) do nothing;

-- Seed 10 sample quiz questions for Quiz Blitz
insert into public.quiz_questions (event_id, question, options, correct_option_index, is_active)
values
  (
    'e0000000-0000-0000-0000-000000000001',
    'Apa kepanjangan dari singkatan CPU dalam komputer?',
    '["Central Processing Unit", "Central Power Unit", "Core Processing Utility", "Computer Personal Unit"]'::jsonb,
    0,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'Ibukota negara Indonesia yang baru di Kalimantan Timur bernama?',
    '["Nusantara", "Kutai", "Samarinda", "Balikpapan"]'::jsonb,
    0,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'Komponen komputer yang berfungsi sebagai penyimpan data sementara adalah?',
    '["RAM", "Hard Disk", "Power Supply", "Monitor"]'::jsonb,
    0,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'Bahasa pemrograman yang sering digunakan untuk membuat halaman web interaktif adalah?',
    '["JavaScript", "HTML", "CSS", "SQL"]'::jsonb,
    0,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'Berikut ini yang merupakan contoh perangkat input pada komputer adalah?',
    '["Keyboard", "Monitor", "Speaker", "Printer"]'::jsonb,
    0,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'Protokol jaringan yang digunakan untuk mengakses web yang aman dengan enkripsi adalah?',
    '["HTTPS", "HTTP", "FTP", "SMTP"]'::jsonb,
    0,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'Satuan terkecil data dalam sistem komputasi digital adalah?',
    '["Bit", "Byte", "Kilobyte", "Megabyte"]'::jsonb,
    0,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'Sistem operasi open-source berlogo pinguin yang banyak digunakan pada server adalah?',
    '["Linux", "Windows", "macOS", "DOS"]'::jsonb,
    0,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'Apa fungsi utama dari router dalam jaringan komputer?',
    '["Mengarahkan paket data antar jaringan", "Menampilkan grafis ke layar", "Mendinginkan processor", "Menyimpan file permanen"]'::jsonb,
    0,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000001',
    'SMK Telkom Purwokerto terletak di provinsi?',
    '["Jawa Tengah", "Jawa Barat", "Jawa Timur", "DI Yogyakarta"]'::jsonb,
    0,
    true
  );
