import React, { useState } from 'react';
import { Volume2, Info } from 'lucide-react';
import { speechManager } from '../utils/speech';

interface ToneItem {
  number: number;
  nameZh: string;
  nameId: string;
  contour: string; // e.g. 5-5
  symbol: string;
  analogy: string;
  pitchDesc: string;
  samplePinyin: string;
  sampleHanzi: string;
  sampleMeaning: string;
}

const TONES_DATA: ToneItem[] = [
  {
    number: 1,
    nameZh: '第一声 (阴平)',
    nameId: 'Nada 1: Datar Tinggi',
    contour: '5-5',
    symbol: 'ˉ (mā)',
    analogy: 'Seperti menyanyikan nada "Sol" yang panjang dan stabil tanpa goyah.',
    pitchDesc: 'Dimulai dari nada tinggi suara alamimu dan ditahan datar rata hingga akhir.',
    samplePinyin: 'mā',
    sampleHanzi: '妈',
    sampleMeaning: 'Ibu'
  },
  {
    number: 2,
    nameZh: '第二声 (阳平)',
    nameId: 'Nada 2: Naik Bertanya',
    contour: '3-5',
    symbol: 'ˊ (má)',
    analogy: 'Persis seperti intonasi saat kamu kaget atau bertanya: "Hah?!", "Apa?!"',
    pitchDesc: 'Dimulai dari nada sedang lalu meluncur naik tajam ke nada tinggi.',
    samplePinyin: 'má',
    sampleHanzi: '麻',
    sampleMeaning: 'Rami / Kebas'
  },
  {
    number: 3,
    nameZh: '第三声 (上声)',
    nameId: 'Nada 3: Turun-Naik',
    contour: '2-1-4',
    symbol: 'ˇ (mǎ)',
    analogy: 'Seperti saat kamu mengangguk mengerti dengan ragu: "O... oh!"',
    pitchDesc: 'Dimulai agak rendah, turun ke dasar pita suara terendah, lalu naik sedikit.',
    samplePinyin: 'mǎ',
    sampleHanzi: '马',
    sampleMeaning: 'Kuda'
  },
  {
    number: 4,
    nameZh: '第四声 (去声)',
    nameId: 'Nada 4: Menghujam Tegas',
    contour: '5-1',
    symbol: 'ˋ (mà)',
    analogy: 'Persis seperti saat kamu berseru tegas: "Tidak!", "Stop!"',
    pitchDesc: 'Dimulai dari puncak nada tertinggi lalu menjatuhkan suara cepat ke bawah.',
    samplePinyin: 'mà',
    sampleHanzi: '骂',
    sampleMeaning: 'Memarahi'
  }
];

const MA_FAMILY = [
  { tone: 1, pinyin: 'mā', hanzi: '妈', meaning: 'Ibu', mark: 'ˉ' },
  { tone: 2, pinyin: 'má', hanzi: '麻', meaning: 'Rami / Kebas', mark: 'ˊ' },
  { tone: 3, pinyin: 'mǎ', hanzi: '马', meaning: 'Kuda', mark: 'ˇ' },
  { tone: 4, pinyin: 'mà', hanzi: '骂', meaning: 'Memarahi', mark: 'ˋ' },
  { tone: 0, pinyin: 'ma', hanzi: '吗', meaning: 'Partikel tanya (kah?)', mark: 'netral' }
];

interface SandhiRule {
  id: string;
  title: string;
  pinyinRule: string;
  ruleFormula: string;
  description: string;
  examples: {
    hanzi: string;
    writtenPinyin: string;
    spokenPinyin: string;
    meaning: string;
  }[];
}

const SANDHI_RULES: SandhiRule[] = [
  {
    id: 'sandhi-33',
    title: '1. Dua Nada 3 Bertemu (3 + 3 → 2 + 3)',
    pinyinRule: '三声变调 (Sān shēng biàn diào)',
    ruleFormula: 'Nada 3 + Nada 3 ⇒ Nada 2 + Nada 3',
    description: 'Jika ada dua karakter ber-Nada 3 berurutan, mengucapkan dua nada turun-naik berturut-turut sangat melelahkan pita suara. Karena itu, nada 3 pertama OTOMATIS BERUBAH menjadi Nada 2 saat diucapkan, meskipun pinyin aslinya tetap ditulis nada 3!',
    examples: [
      {
        hanzi: '你好',
        writtenPinyin: 'nǐ hǎo',
        spokenPinyin: 'ní hǎo',
        meaning: 'Halo / Apa kabar'
      },
      {
        hanzi: '可以',
        writtenPinyin: 'kě yǐ',
        spokenPinyin: 'ké yǐ',
        meaning: 'Boleh / Bisa'
      },
      {
        hanzi: '手表',
        writtenPinyin: 'shǒu biǎo',
        spokenPinyin: 'shóu biǎo',
        meaning: 'Jam tangan'
      },
      {
        hanzi: '很好',
        writtenPinyin: 'hěn hǎo',
        spokenPinyin: 'hén hǎo',
        meaning: 'Sangat baik'
      }
    ]
  },
  {
    id: 'sandhi-bu',
    title: '2. Perubahan Kata "不" (bù → bú)',
    pinyinRule: '“不”的变调',
    ruleFormula: '不 (bù, nada 4) + Nada 4 ⇒ bú (nada 2) + Nada 4',
    description: 'Kata "不" (tidak/bukan) nada aslinya adalah Nada 4 (bù). Namun bila kata di belakangnya juga ber-Nada 4, maka "不" WAJIB berubah menjadi Nada 2 (bú) agar tidak terjadi dua hentakan keras berturut-turut.',
    examples: [
      {
        hanzi: '不是',
        writtenPinyin: 'bù shì',
        spokenPinyin: 'bú shì',
        meaning: 'Bukan'
      },
      {
        hanzi: '不要',
        writtenPinyin: 'bù yào',
        spokenPinyin: 'bú yào',
        meaning: 'Jangan / Tidak mau'
      },
      {
        hanzi: '不对',
        writtenPinyin: 'bù duì',
        spokenPinyin: 'bú duì',
        meaning: 'Tidak benar / Salah'
      },
      {
        hanzi: '不好',
        writtenPinyin: 'bù hǎo',
        spokenPinyin: 'bù hǎo (tetap nada 4)',
        meaning: 'Tidak baik (karena 好 nada 3)'
      }
    ]
  },
  {
    id: 'sandhi-yi',
    title: '3. Perubahan Kata "一" (yī → yí / yì)',
    pinyinRule: '“一”的变调',
    ruleFormula: '一 (yī, nada 1) ⇒ yí (nada 2) sebelum nada 4 | yì (nada 4) sebelum nada 1, 2, 3',
    description: 'Angka satu aslinya adalah Nada 1 (yī saat menghitung 1, 2, 3 atau nomor telepon). Namun saat digabung dengan kata lain: berubah jadi Nada 2 (yí) jika di depan nada 4, dan berubah jadi Nada 4 (yì) jika di depan nada 1, 2, atau 3.',
    examples: [
      {
        hanzi: '一定',
        writtenPinyin: 'yī dìng',
        spokenPinyin: 'yí dìng',
        meaning: 'Pasti / Tentu saja (depan nada 4)'
      },
      {
        hanzi: '一块',
        writtenPinyin: 'yī kuài',
        spokenPinyin: 'yí kuài',
        meaning: 'Satu yuan / Bersama (depan nada 4)'
      },
      {
        hanzi: '一天',
        writtenPinyin: 'yī tiān',
        spokenPinyin: 'yì tiān',
        meaning: 'Satu hari (depan nada 1)'
      },
      {
        hanzi: '一起',
        writtenPinyin: 'yī qǐ',
        spokenPinyin: 'yì qǐ',
        meaning: 'Bersama-sama (depan nada 3)'
      }
    ]
  }
];

export const PinyinTonesGuideView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'tones' | 'sandhi'>('tones');
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const handlePlayAudio = (text: string, key: string) => {
    setPlayingKey(key);
    speechManager.speak(text, 0.8);
    setTimeout(() => {
      setPlayingKey(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-6 animate-in fade-in">
      {/* Official Syllabus Header Banner */}
      <div className="bg-gradient-to-r from-red-900/90 via-stone-900 to-red-950 text-white rounded-3xl p-5 sm:p-6 border border-red-800/60 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-red-600/80 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Standar Fonetik HSK 3.0
              </span>
              <span className="text-xs text-red-300 font-mono">声调与变调</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Panduan 4 Nada Pinyin & Aturan Perubahan Nada (Tone Sandhi)
            </h2>
            <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
              Bahasa Mandarin adalah bahasa bernada (tonal language). Perubahan tinggi-rendahnya nada menentukan makna kata secara menyeluruh. Dengarkan audio untuk membedakan karakternya.
            </p>
          </div>

          {/* Sub-mode switcher */}
          <div className="flex bg-stone-950/70 p-1 rounded-2xl text-xs font-semibold self-start sm:self-center border border-stone-800 flex-shrink-0">
            <button
              onClick={() => setActiveCategory('tones')}
              className={`py-2 px-3 rounded-xl transition ${
                activeCategory === 'tones' ? 'bg-red-700 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              4 Nada Pokok
            </button>
            <button
              onClick={() => setActiveCategory('sandhi')}
              className={`py-2 px-3 rounded-xl transition ${
                activeCategory === 'sandhi' ? 'bg-red-700 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Aturan Perubahan (变调)
            </button>
          </div>
        </div>
      </div>

      {activeCategory === 'tones' ? (
        <div className="space-y-6">
          {/* Classic "Ma" Family Demo Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                  Studi Kasus: 1 Suku Kata "Ma", 5 Makna Berbeda
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Klik tiap tombol audio untuk mendengarkan langsung perbedaan nada yang mengubah arti kata:
                </p>
              </div>
              <span className="text-[10px] bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/50">
                Penting
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {MA_FAMILY.map((item) => {
                const isPlaying = playingKey === `ma-${item.tone}`;
                return (
                  <button
                    key={item.tone}
                    onClick={() => handlePlayAudio(item.hanzi, `ma-${item.tone}`)}
                    className="p-3 bg-stone-50 dark:bg-stone-800/60 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 text-center transition group active:scale-95 flex flex-col items-center justify-between"
                  >
                    <div className="flex items-center justify-between w-full text-[10px] text-stone-400 font-semibold mb-1">
                      <span>{item.tone === 0 ? 'Netral' : `Nada ${item.tone}`}</span>
                      <span className="font-mono text-red-700 dark:text-red-400">{item.mark}</span>
                    </div>

                    <div className="font-serif font-bold text-3xl text-stone-900 dark:text-stone-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition my-1">
                      {item.hanzi}
                    </div>

                    <div className="text-sm font-bold text-red-700 dark:text-red-400 font-sans">
                      {item.pinyin}
                    </div>

                    <div className="text-[11px] text-stone-600 dark:text-stone-300 font-medium truncate w-full mt-0.5">
                      {item.meaning}
                    </div>

                    <div className={`mt-2.5 py-1 px-3 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                      isPlaying 
                        ? 'bg-red-700 text-white' 
                        : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-600 group-hover:border-red-300'
                    }`}>
                      <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-bounce' : ''}`} />
                      <span>Dengar</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Primary Tone Deep Dive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TONES_DATA.map((tone) => {
              const isPlaying = playingKey === `tone-${tone.number}`;
              return (
                <div 
                  key={tone.number}
                  className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-red-700 dark:text-red-400 font-mono">
                          {tone.nameZh} &bull; Kontur {tone.contour}
                        </span>
                        <h4 className="font-bold text-base text-stone-900 dark:text-stone-100 mt-0.5">
                          {tone.nameId}
                        </h4>
                      </div>

                      <button
                        onClick={() => handlePlayAudio(tone.sampleHanzi, `tone-${tone.number}`)}
                        className={`p-2 rounded-2xl border transition active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                          isPlaying
                            ? 'bg-red-700 text-white border-red-700'
                            : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50 hover:bg-red-100'
                        }`}
                        title="Dengarkan pelafalan nada"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{tone.samplePinyin}</span>
                      </button>
                    </div>

                    {/* Analogy & Pitch Desc */}
                    <div className="space-y-2 mt-3 text-xs">
                      <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-100 dark:border-stone-700/60">
                        <span className="text-stone-400 font-semibold block text-[10px] uppercase">Analogi Nada:</span>
                        <span className="text-stone-700 dark:text-stone-300 font-medium">{tone.analogy}</span>
                      </div>

                      <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-100 dark:border-stone-700/60">
                        <span className="text-stone-400 font-semibold block text-[10px] uppercase">Bentuk Suara:</span>
                        <span className="text-stone-600 dark:text-stone-400">{tone.pitchDesc}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-medium">Contoh Kata:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">{tone.sampleHanzi}</span>
                      <span className="text-red-700 dark:text-red-400 font-bold">{tone.samplePinyin}</span>
                      <span className="text-stone-500 dark:text-stone-400">({tone.sampleMeaning})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* MODE 2: TONE SANDHI (ATURAN PERUBAHAN NADA) */
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-3xl border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-amber-900 dark:text-amber-200">
                Apa itu Tone Sandhi (变调 / Biàndiào)?
              </h4>
              <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                Di dalam percakapan sehari-hari, beberapa kata mengalami <strong>perubahan nada otomatis saat diucapkan</strong> agar aliran kalimat terasa lebih luwes dan mudah diucapkan. Walaupun nadanya berubah ketika diucapkan, ejaan Pinyin di buku teks biasanya tetap mempertahankan nada aslinya!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {SANDHI_RULES.map((rule) => (
              <div 
                key={rule.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 transition-colors"
              >
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-red-700 dark:text-red-400 font-mono">
                      {rule.pinyinRule}
                    </span>
                    <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                      Aturan Wajib
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                    {rule.title}
                  </h3>

                  <div className="mt-2 inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-xl font-mono text-xs font-bold text-stone-800 dark:text-stone-200">
                    {rule.ruleFormula}
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-2">
                    {rule.description}
                  </p>
                </div>

                {/* Interactive Audio Examples */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Contoh Praktik & Perbandingan Bunyi:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {rule.examples.map((ex, idx) => {
                      const isPlaying = playingKey === `${rule.id}-${idx}`;
                      return (
                        <div 
                          key={idx}
                          className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-100 dark:border-stone-700/60 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100 flex-shrink-0">
                              {ex.hanzi}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                Tertulis: <span className="text-stone-500 font-mono">{ex.writtenPinyin}</span>
                              </div>
                              <div className="text-xs font-bold text-red-700 dark:text-red-400 font-mono">
                                Diucapkan: {ex.spokenPinyin}
                              </div>
                              <div className="text-[11px] text-stone-400 truncate mt-0.5">
                                {ex.meaning}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handlePlayAudio(ex.hanzi, `${rule.id}-${idx}`)}
                            className={`p-2 rounded-xl border transition active:scale-95 flex items-center gap-1 text-xs font-bold flex-shrink-0 ${
                              isPlaying
                                ? 'bg-red-700 text-white border-red-700'
                                : 'bg-white dark:bg-stone-800 text-red-700 dark:text-red-400 border-stone-200 dark:border-stone-700 hover:bg-red-50'
                            }`}
                            title="Dengarkan pengucapan asli"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Audio</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
