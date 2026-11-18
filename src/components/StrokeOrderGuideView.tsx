import React, { useState } from 'react';
import { HanziWriterCanvas } from './HanziWriterCanvas';
import { focusRing } from './ui/tokens';

interface StrokeRule {
  id: string;
  ruleNameId: string;
  ruleNameZh: string;
  pinyin: string;
  summary: string;
  explanation: string;
  demoChar: string;
  demoPinyin: string;
  demoMeaning: string;
  otherExamples: { char: string; pinyin: string; meaning: string }[];
}

const STROKE_RULES: StrokeRule[] = [
  {
    id: 'rule-1',
    ruleNameId: '1. Datar Dulu, Baru Tegak',
    ruleNameZh: '先横后竖',
    pinyin: 'xiān héng hòu shù',
    summary: 'Garis horizontal selalu ditarik terlebih dahulu sebelum garis vertikal yang memotongnya.',
    explanation: 'Logika dasar kaligrafi Tiongkok menempatkan garis datar sebagai fondasi pijakan sebelum tiang tegak ditancapkan di atasnya.',
    demoChar: '十',
    demoPinyin: 'shí',
    demoMeaning: 'Sepuluh',
    otherExamples: [
      { char: '土', pinyin: 'tǔ', meaning: 'Tanah' },
      { char: '干', pinyin: 'gān', meaning: 'Kering / Bekerja' },
      { char: '丰', pinyin: 'fēng', meaning: 'Subur / Berlimpah' }
    ]
  },
  {
    id: 'rule-2',
    ruleNameId: '2. Miring Kiri Dulu, Baru Miring Kanan',
    ruleNameZh: '先撇后捺',
    pinyin: 'xiān piě hòu nà',
    summary: 'Goresan miring ke kiri (撇) dibuat duluan sebelum goresan miring ke kanan (捺).',
    explanation: 'Karena gerakan tangan kanan secara alami menyapu dari kiri ke kanan, goresan kiri selalu menopang sebelum sisi kanan ditutup seimbang.',
    demoChar: '人',
    demoPinyin: 'rén',
    demoMeaning: 'Orang / Manusia',
    otherExamples: [
      { char: '八', pinyin: 'bā', meaning: 'Delapan' },
      { char: '大', pinyin: 'dà', meaning: 'Besar' },
      { char: '天', pinyin: 'tiān', meaning: 'Langit / Hari' }
    ]
  },
  {
    id: 'rule-3',
    ruleNameId: '3. Dari Atas ke Bawah',
    ruleNameZh: '从上到下',
    pinyin: 'cóng shàng dào xià',
    summary: 'Karakter dengan susunan vertikal ditulis lapis demi lapis dari bagian paling atas ke bawah.',
    explanation: 'Menjaga keseimbangan vertikal aksara agar tidak miring dan proporsi tinggi huruf tetap serasi di dalam kotak beras (Mi Zi Ge).',
    demoChar: '三',
    demoPinyin: 'sān',
    demoMeaning: 'Tiga',
    otherExamples: [
      { char: '二', pinyin: 'èr', meaning: 'Dua' },
      { char: '言', pinyin: 'yán', meaning: 'Kata / Bahasa' },
      { char: '早', pinyin: 'zǎo', meaning: 'Pagi / Awal' }
    ]
  },
  {
    id: 'rule-4',
    ruleNameId: '4. Dari Kiri ke Kanan',
    ruleNameZh: '从左到右',
    pinyin: 'cóng zuǒ dào yòu',
    summary: 'Aksara dengan komponen majemuk horizontal diselesaikan radikal kiri terlebih dahulu baru bagian kanannya.',
    explanation: 'Mayoritas kosakata Mandarin (>60%) memiliki struktur kiri-kanan (seperti radikal orang 亻 atau radikal air 氵). Selesaikan sisi kiri terlebih dahulu.',
    demoChar: '你',
    demoPinyin: 'nǐ',
    demoMeaning: 'Kamu',
    otherExamples: [
      { char: '他', pinyin: 'tā', meaning: 'Dia (Laki-laki)' },
      { char: '好', pinyin: 'hǎo', meaning: 'Baik / Bagus' },
      { char: '明', pinyin: 'míng', meaning: 'Terang / Jelas' }
    ]
  },
  {
    id: 'rule-5',
    ruleNameId: '5. Dari Luar ke Dalam',
    ruleNameZh: '从外到内',
    pinyin: 'cóng wài dào nèi',
    summary: 'Untuk bingkai luar yang terbuka sebagian, buat kerangka luar terlebih dahulu sebelum memasukkan isi.',
    explanation: 'Bingkai luar menetapkan batas ukuran aksara agar elemen yang ada di dalamnya pas dan tidak tumpah keluar garis batas.',
    demoChar: '月',
    demoPinyin: 'yuè',
    demoMeaning: 'Bulan',
    otherExamples: [
      { char: '同', pinyin: 'tóng', meaning: 'Sama / Bersama' },
      { char: '问', pinyin: 'wèn', meaning: 'Bertanya' },
      { char: '风', pinyin: 'fēng', meaning: 'Angin' }
    ]
  },
  {
    id: 'rule-6',
    ruleNameId: '6. Luar Dulu, Isi Dalamnya, Baru Tutup Bawah',
    ruleNameZh: '先外后内再封口',
    pinyin: 'xiān wài hòu nèi zài fēng kǒu',
    summary: 'Aturan "Masuk kamar dulu, baru kunci pintu": buat kotak luar (kiri dan atas-kanan), isi bagian dalam, baru garis bawah ditutup.',
    explanation: 'Ini adalah kesalahan paling sering pemula! Jangan pernah menutup kotak sebelum isi dalamnya selesai ditulis.',
    demoChar: '日',
    demoPinyin: 'rì',
    demoMeaning: 'Matahari / Hari',
    otherExamples: [
      { char: '四', pinyin: 'sì', meaning: 'Empat' },
      { char: '国', pinyin: 'guó', meaning: 'Negara' },
      { char: '田', pinyin: 'tián', meaning: 'Sawah' }
    ]
  },
  {
    id: 'rule-7',
    ruleNameId: '7. Tengah Dulu, Baru Kedua Sisi',
    ruleNameZh: '先中间后两边',
    pinyin: 'xiān zhōng jiān hòu liǎng biān',
    summary: 'Untuk karakter simetris dengan tiang tegak di tengah, buat tiang tengah terlebih dahulu sebelum sayap kiri dan kanan.',
    explanation: 'Batang tengah menjadi jangkar utama pusat gravitasi aksara, sehingga goresan kiri dan kanannya bisa diletakkan simetris sempurna.',
    demoChar: '小',
    demoPinyin: 'xiǎo',
    demoMeaning: 'Kecil',
    otherExamples: [
      { char: '水', pinyin: 'shuǐ', meaning: 'Air' },
      { char: '木', pinyin: 'mù', meaning: 'Kayu / Pohon' },
      { char: '办', pinyin: 'bàn', meaning: 'Mengurus / Menangani' }
    ]
  }
];

const BASIC_STROKES = [
  { nameZh: '横', nameId: 'Datar', pinyin: 'héng', symbol: '一', example: '一、十、三', desc: 'Ditarik lurus mendatar dari kiri ke kanan dengan tekanan stabil.' },
  { nameZh: '竖', nameId: 'Tegak', pinyin: 'shù', symbol: '丨', example: '十、中、木', desc: 'Ditarik lurus vertikal dari atas ke bawah tegak lurus.' },
  { nameZh: '撇', nameId: 'Miring Kiri', pinyin: 'piě', symbol: '丿', example: '人、八、大', desc: 'Ditarik dari kanan atas melengkung miring ke kiri bawah makin tipis.' },
  { nameZh: '捺', nameId: 'Miring Kanan', pinyin: 'nà', symbol: '乀', example: '人、大、天', desc: 'Ditarik dari kiri atas melengkung ke kanan bawah dengan hentakan tebal di ujung.' },
  { nameZh: '点', nameId: 'Titik', pinyin: 'diǎn', symbol: '丶', example: '下、六、小', desc: 'Titik pendek ditekan dari atas ke kanan bawah.' },
  { nameZh: '提', nameId: 'Sentakan Naik', pinyin: 'tí', symbol: 'ˊ', example: '我、地、冷', desc: 'Ditarik cepat dari kiri bawah menyentak miring ke kanan atas.' },
  { nameZh: '折', nameId: 'Tikungan / Patah', pinyin: 'zhé', symbol: '乛', example: '口、日、四', desc: 'Goresan berbelok membentuk sudut tegas tanpa mengangkat kuas.' },
  { nameZh: '钩', nameId: 'Kait', pinyin: 'gōu', symbol: '亅', example: '小、子、你', desc: 'Kait runcing di bagian akhir goresan vertikal atau lengkung.' }
];

export const StrokeOrderGuideView: React.FC = () => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>('rule-1');
  const [viewMode, setViewMode] = useState<'rules' | 'strokes'>('rules');

  const activeRule = STROKE_RULES.find(r => r.id === selectedRuleId) || STROKE_RULES[0];
  const [activeChar, setActiveChar] = useState<string>(activeRule.demoChar);

  const handleSelectRule = (rule: StrokeRule) => {
    setSelectedRuleId(rule.id);
    setActiveChar(rule.demoChar);
  };

  const label = 'text-[11px] font-medium uppercase tracking-[0.14em] text-muted';
  const stripNum = (t: string) => t.replace(/^\d+\.\s*/, '');

  return (
    <div className="space-y-10 pb-6 animate-in fade-in">
      {/* Masthead */}
      <header className="border-t-2 border-ink pt-3">
        <div className="flex items-baseline justify-between">
          <span className={label}>Standar resmi HSK 3.0</span>
          <span className={`${label} tabular-nums`}>GF 0025-2021</span>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">7 aturan urutan goresan</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Karakter Mandarin tidak digambar bebas, melainkan disusun menurut urutan goresan baku (笔顺 / Bǐshùn). Mengikuti aturan ini membuat tulisanmu rapi, proporsional, dan mudah dibaca penutur asli.
            </p>
          </div>
          <div role="tablist" aria-label="Mode panduan" className="flex gap-5 text-sm flex-shrink-0">
            {([['rules', '7 aturan baku'], ['strokes', '8 goresan dasar']] as const).map(([mode, name]) => (
              <button
                key={mode}
                role="tab"
                aria-selected={viewMode === mode}
                onClick={() => setViewMode(mode)}
                className={`pb-1 border-b-2 transition-colors ${focusRing} ${
                  viewMode === mode ? 'border-vermilion text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {viewMode === 'rules' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8 items-start">
          {/* Rule list */}
          <ol className="lg:col-span-5 border-t border-ink">
            {STROKE_RULES.map((rule, i) => {
              const selected = rule.id === selectedRuleId;
              return (
                <li key={rule.id} className="border-b border-ink/20">
                  <button
                    onClick={() => handleSelectRule(rule)}
                    aria-current={selected ? 'true' : undefined}
                    className={`group relative w-full grid grid-cols-[2rem_3rem_1fr] items-center gap-3 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion ${
                      selected ? 'bg-paper-2' : 'hover:bg-paper-2'
                    }`}
                  >
                    {selected && <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 bg-vermilion" />}
                    <span className={`pl-3 text-xs tabular-nums ${selected ? 'text-vermilion font-semibold' : 'text-muted'}`}>{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-serif font-black text-3xl leading-none text-ink text-center">{rule.demoChar}</span>
                    <span className="min-w-0 pr-2">
                      <span className="block text-sm font-semibold text-ink">{stripNum(rule.ruleNameId)}</span>
                      <span className="block text-xs text-muted truncate">{rule.ruleNameZh} · {rule.pinyin}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Detail */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className={`${label} text-vermilion`}>{activeRule.ruleNameZh} · {activeRule.pinyin}</div>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{stripNum(activeRule.ruleNameId)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{activeRule.summary}</p>
            </div>

            <div>
              <div className={`${label} mb-3`}>Uji urutan goresan &mdash; <span className="font-serif text-ink normal-case tracking-normal text-sm">{activeChar}</span></div>
              <div className="flex justify-center">
                <HanziWriterCanvas text={activeChar} size={230} />
              </div>
            </div>

            <div>
              <div className={`${label} border-t border-ink pt-3`}>Coba karakter lain dengan aturan ini</div>
              <div className="grid grid-cols-4 divide-x divide-ink/20 border-b border-ink/20">
                {[
                  { char: activeRule.demoChar, pinyin: activeRule.demoPinyin, meaning: activeRule.demoMeaning },
                  ...activeRule.otherExamples
                ].map((item) => {
                  const on = activeChar === item.char;
                  return (
                    <button
                      key={item.char}
                      onClick={() => setActiveChar(item.char)}
                      aria-pressed={on}
                      className={`py-4 px-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-vermilion ${on ? 'bg-ink text-paper' : 'hover:bg-paper-2 text-ink'}`}
                    >
                      <span className="block font-serif font-black text-3xl leading-none">{item.char}</span>
                      <span className={`block mt-2 text-xs font-semibold ${on ? 'text-paper' : 'text-vermilion'}`}>{item.pinyin}</span>
                      <span className={`block text-[10px] truncate ${on ? 'text-paper/70' : 'text-muted'}`}>{item.meaning}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-l-2 border-vermilion pl-4">
              <div className={label}>Mengapa aturan ini penting</div>
              <p className="mt-1 text-sm leading-relaxed text-ink">{activeRule.explanation}</p>
            </div>
          </div>
        </div>
      ) : (
        <section>
          <div className="max-w-xl">
            <h3 className="text-xl font-semibold tracking-tight text-ink">8 bentuk goresan dasar (基本笔画)</h3>
            <p className="mt-1 text-sm text-muted">
              Ribuan aksara yang tampak rumit sebenarnya hanya dibangun dari 8 bentuk goresan primer berikut.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-ink">
            {BASIC_STROKES.map((stroke, idx) => (
              <div key={idx} className="py-5 sm:px-5 sm:first:pl-0 border-b border-ink/20 lg:[&:nth-child(4n+1)]:pl-0 sm:border-l sm:border-ink/20 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(2n+1)]:border-l lg:[&:nth-child(4n+1)]:border-l-0 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="font-serif font-black text-6xl leading-none text-ink">{stroke.symbol}</span>
                    <span className="text-xs tabular-nums text-muted">{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="mt-3 text-sm font-semibold text-ink">{stroke.nameId} ({stroke.nameZh})</div>
                  <div className="text-xs font-semibold text-vermilion">{stroke.pinyin}</div>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{stroke.desc}</p>
                </div>
                <div className="text-xs border-t border-ink/20 pt-2">
                  <span className="text-muted">Contoh: </span>
                  <span className="font-serif font-bold text-ink">{stroke.example}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
