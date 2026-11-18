import React, { useState } from 'react';
import { speechManager } from '../utils/speech';
import { AudioIcon, focusRing } from './ui/marks';

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

/** Pitch contour on the 5-level Chao scale, e.g. "2-1-4". Real data, not decoration. */
const ToneContour: React.FC<{ contour: string }> = ({ contour }) => {
  const levels = contour.split('-').map(Number);
  const w = 120;
  const h = 56;
  const pad = 6;
  const x = (i: number) => (levels.length === 1 ? w / 2 : pad + (i * (w - pad * 2)) / (levels.length - 1));
  const y = (lv: number) => pad + ((5 - lv) * (h - pad * 2)) / 4;
  const pts = levels.map((lv, i) => `${x(i)},${y(lv)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-28 h-14 text-ink" role="img" aria-label={`Kontur nada ${contour}`}>
      {[1, 2, 3, 4, 5].map(lv => (
        <line key={lv} x1="0" x2={w} y1={y(lv)} y2={y(lv)} stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
      ))}
      <polyline points={pts} fill="none" stroke="var(--vermilion)" strokeWidth="3" strokeLinejoin="miter" strokeLinecap="butt" />
      <circle cx={x(0)} cy={y(levels[0])} r="3.5" fill="currentColor" />
    </svg>
  );
};

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

  const label = 'text-[11px] font-medium uppercase tracking-[0.14em] text-muted';
  const stripNum = (t: string) => t.replace(/^\d+\.\s*/, '');
  const playBtn = (key: string, text: string, caption: string, title: string) => (
    <button
      onClick={() => handlePlayAudio(text, key)}
      title={title}
      aria-label={title}
      className={`flex items-center gap-1.5 border border-ink px-2.5 py-1.5 text-xs font-semibold transition-colors ${focusRing} ${
        playingKey === key ? 'bg-ink text-paper' : 'text-ink hover:bg-ink hover:text-paper'
      }`}
    >
      <AudioIcon className="w-4 h-4" />
      <span>{caption}</span>
    </button>
  );

  return (
    <div className="space-y-10 pb-6 animate-in fade-in">
      {/* Masthead */}
      <header className="border-t-2 border-ink pt-3">
        <div className="flex items-baseline justify-between">
          <span className={label}>Standar fonetik HSK 3.0</span>
          <span className={label}>声调与变调</span>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">4 nada &amp; perubahan nada</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Mandarin adalah bahasa bernada: tinggi-rendahnya suara menentukan makna kata. Dengarkan audio untuk membedakan tiap nada.
            </p>
          </div>
          <div role="tablist" aria-label="Mode panduan" className="flex gap-5 text-sm flex-shrink-0">
            {([['tones', '4 nada pokok'], ['sandhi', 'Perubahan nada (变调)']] as const).map(([mode, name]) => (
              <button
                key={mode}
                role="tab"
                aria-selected={activeCategory === mode}
                onClick={() => setActiveCategory(mode)}
                className={`pb-1 border-b-2 transition-colors ${focusRing} ${
                  activeCategory === mode ? 'border-vermilion text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeCategory === 'tones' ? (
        <>
          {/* Ma family */}
          <section>
            <div className="border-t border-ink pt-3">
              <h3 className="text-lg font-semibold tracking-tight text-ink">Satu suku kata &ldquo;ma&rdquo;, lima makna</h3>
              <p className="mt-1 text-sm text-muted">Ketuk tiap kolom untuk mendengar bagaimana nada mengubah arti.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 border-y border-ink/20 sm:divide-x divide-ink/20">
              {MA_FAMILY.map((item) => {
                const isPlaying = playingKey === `ma-${item.tone}`;
                return (
                  <button
                    key={item.tone}
                    onClick={() => handlePlayAudio(item.hanzi, `ma-${item.tone}`)}
                    aria-label={`Dengar ${item.pinyin}, ${item.meaning}`}
                    className={`group text-left px-3 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion ${isPlaying ? 'bg-ink text-paper' : 'hover:bg-paper-2 text-ink'}`}
                  >
                    <span className={`flex justify-between text-[11px] font-medium uppercase tracking-[0.14em] ${isPlaying ? 'text-paper/70' : 'text-muted'}`}>
                      <span>{item.tone === 0 ? 'Netral' : `Nada ${item.tone}`}</span>
                      <span aria-hidden className="text-xl leading-none normal-case tracking-normal text-vermilion">{item.mark === 'netral' ? '' : item.mark}</span>
                    </span>
                    <span className="block mt-3 font-serif font-black text-5xl leading-none">{item.hanzi}</span>
                    <span className={`block mt-3 text-base font-semibold ${isPlaying ? 'text-paper' : 'text-vermilion'}`}>{item.pinyin}</span>
                    <span className={`block text-xs truncate ${isPlaying ? 'text-paper/80' : 'text-muted'}`}>{item.meaning}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Four tones */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
            {TONES_DATA.map((tone) => (
              <article key={tone.number} className="border-t border-ink pt-3 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`${label} text-vermilion`}>{tone.nameZh} · kontur {tone.contour}</div>
                    <h4 className="mt-1 text-lg font-semibold tracking-tight text-ink">{stripNum(tone.nameId.replace(/^Nada \d+:\s*/, ''))}</h4>
                  </div>
                  <ToneContour contour={tone.contour} />
                </div>

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className={label}>Analogi</dt>
                    <dd className="mt-0.5 text-ink">{tone.analogy}</dd>
                  </div>
                  <div>
                    <dt className={label}>Bentuk suara</dt>
                    <dd className="mt-0.5 text-muted">{tone.pitchDesc}</dd>
                  </div>
                </dl>

                <div className="mt-auto flex items-center justify-between border-t border-ink/20 pt-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif font-black text-3xl leading-none text-ink">{tone.sampleHanzi}</span>
                    <span className="text-sm font-semibold text-vermilion">{tone.samplePinyin}</span>
                    <span className="text-xs text-muted">{tone.sampleMeaning}</span>
                  </div>
                  {playBtn(`tone-${tone.number}`, tone.sampleHanzi, 'Dengar', 'Dengarkan pelafalan nada')}
                </div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <>
          <div className="border-l-2 border-vermilion pl-4 max-w-2xl">
            <div className={label}>Apa itu tone sandhi (变调 / Biàndiào)?</div>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              Dalam percakapan, beberapa kata <strong>berubah nada otomatis saat diucapkan</strong> agar kalimat mengalir lebih luwes. Walau bunyinya berubah, pinyin di buku teks tetap menulis nada aslinya.
            </p>
          </div>

          <div className="space-y-12">
            {SANDHI_RULES.map((rule, ri) => (
              <section key={rule.id} className="border-t-2 border-ink pt-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-vermilion text-sm font-semibold tabular-nums">{String(ri + 1).padStart(2, '0')}</span>
                  <span className={label}>{rule.pinyinRule}</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{stripNum(rule.title)}</h3>
                <div className="mt-3 inline-block border border-ink px-3 py-1.5 text-sm font-semibold text-ink">{rule.ruleFormula}</div>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{rule.description}</p>

                <div className={`${label} mt-6`}>Contoh &amp; perbandingan bunyi</div>
                <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 border-t border-ink sm:gap-x-10">
                  {rule.examples.map((ex, idx) => (
                    <li key={idx} className="border-b border-ink/20 py-3 grid grid-cols-[4.5rem_1fr_auto] items-center gap-3">
                      <span className="font-serif font-black text-2xl leading-none text-ink whitespace-nowrap">{ex.hanzi}</span>
                      <span className="min-w-0 text-xs">
                        <span className="block text-muted">Tertulis <span className="text-ink font-semibold">{ex.writtenPinyin}</span></span>
                        <span className="block text-muted">Diucapkan <span className="text-vermilion font-semibold">{ex.spokenPinyin}</span></span>
                        <span className="block text-muted truncate">{ex.meaning}</span>
                      </span>
                      {playBtn(`${rule.id}-${idx}`, ex.hanzi, 'Audio', 'Dengarkan pengucapan asli')}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
