# 🇨🇳 HanziLearn · Web Belajar Bahasa Mandarin & Menulis Aksara HSK 1

Aplikasi web interaktif untuk belajar kosakata bahasa Mandarin (HSK 1) mandiri, lengkap dengan audio pelafalan, panduan animasi urutan goresan, kuis interaktif, dan kanvas latihan menulis Hanzi berbasis stroke-recognition di browser.

Didesain untuk pembelajar Indonesia dengan terjemahan alami, contoh kalimat, dan sistem retensi memori (SRS).

---

## ✨ Fitur Utama

1. **Kanvas Latihan Menulis Interaktif (`HanziWriterCanvas`)**:
   - **Mode Animasi**: Melihat urutan goresan Hanzi langkah demi langkah (bisa diatur kecepatannya 0.75x, 1x, 1.5x).
   - **Mode Latihan Tulis (Quizzing)**: Menggoreskan karakter langsung dengan mouse / jari / stylus. Dilengkapi koreksi goresan otomatis secara *real-time*, hitungan kesalahan, dan efek selebrasi.
   - **Kisi Kaligrafi (米字格 - Mi Zi Ge)**: Grid pedoman merah klasik untuk melatih proporsi dan keseimbangan tulisan.
   - **Tombol Panduan (Outline Toggle)**: Bayangan transparan bisa dihidupkan untuk pemula atau dimatikan untuk menguji ingatan.

2. **Daftar Kosakata HSK 1 Terkurasi**:
   - Puluhan kata fundamental HSK 1 dikelompokkan ke dalam kategori (Salam, Angka & Waktu, Orang & Keluarga, Makanan, Tempat, Benda, Kata Kerja, Kata Sifat, dll.).
   - Dilengkapi Pinyin, Arti Bahasa Indonesia, Terjemahan Inggris, dan Contoh Kalimat nyata.
   - Audio pelafalan otomatis menggunakan Web Speech API (`zh-CN`).

3. **Sistem Pengingat Hafalan (Spaced Repetition / SRS)**:
   - Tandai kata sebagai *Baru*, *Sedang Belajar*, atau *Sudah Hafal*.
   - Simpan kata favorit / bookmark bintang.
   - Streak harian dan hitungan karakter yang telah kamu tulis tersimpan otomatis di browser (`localStorage`).

4. **Mode Kuis (Quiz Mode)**:
   - Tebak Arti Bahasa Indonesia dari karakter Hanzi.
   - Tebak karakter Hanzi dari arti Bahasa Indonesia.
   - Kuis Menulis Langsung di layar.

5. **Pelajari 16 Radikal Inti (Kangxi Radicals)**:
   - Pahami elemen penyusun Hanzi (misal: 亻/人 untuk manusia, 氵/水 untuk air, 口 untuk mulut).
   - Membantu menghafal struktur Hanzi dengan logika, bukan sekadar hafalan buta.

6. **Latihan Bebas (Sandbox)**:
   - Ketik atau tempel karakter Hanzi apa pun di luar materi untuk langsung melihat animasi goresannya dan berlatih menulis.

---

## 🚀 Cara Menjalankan di Komputer Lokal

```bash
# 1. Masuk ke folder proyek
cd d:\hsk

# 2. Jalankan server pengembang lokal
npm run dev
```

Buka URL yang muncul di terminal (biasanya `http://localhost:5173`) di browser.

---

## 🌐 Cara Deploy ke Vercel / Netlify

Proyek ini adalah Single Page Application (SPA) murni tanpa backend berbayar, sehingga **100% gratis** dideploy ke Vercel atau Netlify.

### Opsi A: Deploy ke Vercel
1. Simpan proyek ke repositori GitHub pribadimu:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi web belajar mandarin"
   # buat repo di github.com lalu push
   git remote add origin https://github.com/USERNAME/mandarin-learn.git
   git push -u origin main
   ```
2. Buka [vercel.com](https://vercel.com) & login dengan GitHub.
3. Klik **"Add New..."** &rarr; **"Project"**, pilih repo GitHub-mu.
4. Vercel akan otomatis mendeteksi konfigurasi `vercel.json` dan Vite. Klik **Deploy**!

### Opsi B: Deploy ke Netlify
1. Buka [netlify.com](https://netlify.com) & login.
2. Hubungkan ke repositori GitHub kamu, atau cukup drag & drop folder `dist` (hasil perintah `npm run build`) ke dashboard Netlify.
3. Konfigurasi `netlify.toml` sudah tersedia sehingga URL reload dan routing berjalan mulus.

---

## 📂 Struktur Proyek

```
d:\hsk/
├── src/
│   ├── components/
│   │   ├── HanziWriterCanvas.tsx   # Mesin animasi & kanvas latihan menulis
│   │   ├── VocabCard.tsx           # Kartu flashcard kosakata & contoh kalimat
│   │   ├── WritingModal.tsx        # Modal fokus latihan menulis
│   │   ├── QuizMode.tsx            # Mode kuis interaktif
│   │   ├── RadicalsView.tsx        # Modul belajar radikal dasar
│   │   ├── CustomCharacterSandbox.tsx # Kanvas tulis karakter bebas
│   │   └── StatsHeader.tsx         # Banner progres, streak & statistik
│   ├── data/
│   │   ├── hsk1.ts                 # Dataset kosakata HSK 1 + arti Indonesia
│   │   └── radicals.ts             # Dataset radikal dasar
│   ├── utils/
│   │   ├── speech.ts               # Audio Web Speech API (zh-CN)
│   │   └── storage.ts              # LocalStorage SRS & streak tracker
│   ├── types/
│   │   ├── index.ts                # TypeScript interfaces
│   │   └── hanzi-writer.d.ts       # Type definitions untuk HanziWriter
│   ├── App.tsx                     # Halaman utama aplikasi
│   ├── main.tsx
│   └── index.css                   # Grid kaligrafi Mi Zi Ge & Tailwind v4
├── vercel.json                     # Konfigurasi deploy Vercel
├── netlify.toml                    # Konfigurasi deploy Netlify
└── package.json
```
