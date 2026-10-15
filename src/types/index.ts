export type HSKLevel = 1 | 2 | 3;

export type WordCategory = 
  | 'Semua'
  | 'Salam & Dasar'
  | 'Angka & Waktu'
  | 'Orang & Keluarga'
  | 'Makanan & Minuman'
  | 'Tempat & Arah'
  | 'Benda & Sehari-hari'
  | 'Kata Kerja & Aktivitas'
  | 'Kata Sifat & Deskripsi'
  | 'Kata Ganti & Tata Bahasa';

export interface ExampleSentence {
  hanzi: string;
  pinyin: string;
  indonesian: string;
}

export interface VocabItem {
  id: string;
  hanzi: string;
  pinyin: string;
  indonesian: string;
  english: string;
  level: HSKLevel;
  category: WordCategory;
  strokeCount?: number;
  examples: ExampleSentence[];
  audioText?: string;
  notes?: string;
}

export interface RadicalItem {
  id: string;
  radical: string;
  variants?: string[];
  pinyin: string;
  meaningId: string;
  strokeCount: number;
  examples: string[];
}

export interface CharacterStory {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  type: 'Piktogram (Gambar Benda)' | 'Ideogram (Konsep Abstrak)' | 'Gabungan Logika (Asosiasi Ide)' | 'Fono-Semantik (Makna + Bunyi)';
  pictogramOrigin: string; // The original shape story
  story: string; // Engaging mnemonic story in Indonesian
  components?: { char: string; meaning: string }[];
  evolution?: string[]; // e.g. ["☉ (Kuno)", "日 (Modern)"]
  sampleWords: { word: string; pinyin: string; meaning: string }[];
  tags: string[];
}

export interface LessonUnit {
  id: string;
  unitNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  wordIds: string[];
}

export type MasteryStatus = 'new' | 'learning' | 'mastered';

export interface WordProgress {
  wordId: string;
  status: MasteryStatus;
  writeSuccessCount: number;
  writeMistakeCount: number;
  lastReviewed: string; // ISO date
  nextReviewDate: string; // ISO date
  intervalDays: number;
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  charactersWritten: number;
  totalQuizzesTaken: number;
  correctQuizAnswers: number;
}
