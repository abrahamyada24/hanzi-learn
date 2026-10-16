import React, { useState } from 'react';
import { 
  PenTool, 
  Info,
  ArrowRight
} from 'lucide-react';
import { HanziWriterCanvas } from './HanziWriterCanvas';

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

  return (
    <div className="space-y-6 pb-6 animate-in fade-in">
      {/* Official Syllabus Header Banner */}
      <div className="bg-gradient-to-r from-red-900/90 via-stone-900 to-red-950 text-white rounded-3xl p-5 sm:p-6 border border-red-800/60 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-red-600/80 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Standar Resmi HSK 3.0
              </span>
              <span className="text-xs text-red-300 font-mono">GF 0025-2021</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Panduan 7 Aturan Urutan Goresan Hanzi
            </h2>
            <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
              Karakter Mandarin tidak digambar bebas, melainkan disusun menurut urutan goresan baku (笔顺 / Bǐshùn). Mengikuti aturan ini membuat tulisanmu rapi, proporsional, dan mudah dibaca oleh penutur asli.
            </p>
          </div>

          {/* Sub-mode switcher */}
          <div className="flex bg-stone-950/70 p-1 rounded-2xl text-xs font-semibold self-start sm:self-center border border-stone-800 flex-shrink-0">
            <button
              onClick={() => setViewMode('rules')}
              className={`py-2 px-3 rounded-xl transition ${
                viewMode === 'rules' ? 'bg-red-700 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              7 Aturan Baku
            </button>
            <button
              onClick={() => setViewMode('strokes')}
              className={`py-2 px-3 rounded-xl transition ${
                viewMode === 'strokes' ? 'bg-red-700 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              8 Goresan Dasar
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'rules' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: 7 Rules Selector List (5 Cols) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider px-1">
              Daftar 7 Aturan Pokok (笔顺规则):
            </div>

            <div className="space-y-2">
              {STROKE_RULES.map((rule) => {
                const isSelected = rule.id === selectedRuleId;
                return (
                  <button
                    key={rule.id}
                    onClick={() => handleSelectRule(rule)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${
                      isSelected
                        ? 'bg-white dark:bg-stone-900 border-red-600 dark:border-red-600 shadow-sm ring-1 ring-red-500/20'
                        : 'bg-white/80 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-lg flex-shrink-0 border ${
                        isSelected 
                          ? 'bg-red-700 text-white border-red-700' 
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-700'
                      }`}>
                        {rule.demoChar}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {rule.ruleNameId}
                        </div>
                        <div className="text-[11px] text-red-700 dark:text-red-400 font-mono">
                          {rule.ruleNameZh} &bull; {rule.pinyin}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      isSelected ? 'text-red-600 translate-x-0.5' : 'text-stone-300 dark:text-stone-600'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Practice & Deep Logic (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-5 transition-colors">
            {/* Rule Header */}
            <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold text-red-700 dark:text-red-400 font-mono">
                  {activeRule.ruleNameZh} ({activeRule.pinyin})
                </span>
                <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded-full font-semibold">
                  Aturan Baku
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                {activeRule.ruleNameId}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-1">
                {activeRule.summary}
              </p>
            </div>

            {/* Hanzi Writer Interactive Canvas */}
            <div className="flex flex-col items-center justify-center py-1">
              <div className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span>Uji Urutan Goresan Karakter: {activeChar}</span>
              </div>
              <HanziWriterCanvas
                text={activeChar}
                size={230}
              />
            </div>

            {/* Quick Practice Chips */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Coba Contoh Karakter Lain dengan Aturan Ini:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { char: activeRule.demoChar, pinyin: activeRule.demoPinyin, meaning: activeRule.demoMeaning },
                  ...activeRule.otherExamples
                ].map((item) => (
                  <button
                    key={item.char}
                    onClick={() => setActiveChar(item.char)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      activeChar === item.char
                        ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-900/60 shadow-2xs'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-100 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    <div className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100">
                      {item.char}
                    </div>
                    <div className="text-xs font-semibold text-red-700 dark:text-red-400">{item.pinyin}</div>
                    <div className="text-[10px] text-stone-400 truncate">{item.meaning}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Why This Rule Exists (Educational Logic) */}
            <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 space-y-1 text-xs">
              <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Mengapa Aturan Ini Penting?</span>
              </div>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed pt-0.5">
                {activeRule.explanation}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: 8 BENTUK GORESAN DASAR (BASIC STROKES) */
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
            <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
              8 Bentuk Goresan Dasar Huruf Hanzi (基本笔画)
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Ribuan aksara Mandarin yang tampak rumit sebenarnya hanya dibangun dari 8 bentuk goresan primer berikut:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BASIC_STROKES.map((stroke, idx) => (
              <div 
                key={idx}
                className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-100 dark:border-stone-700/60 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-3xl text-red-700 dark:text-red-400">
                      {stroke.symbol}
                    </span>
                    <span className="text-[10px] bg-white dark:bg-stone-800 px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 font-mono">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="mt-1">
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {stroke.nameId} ({stroke.nameZh})
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-mono font-semibold">
                      {stroke.pinyin}
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed mt-1.5">
                    {stroke.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 text-[11px]">
                  <span className="text-stone-400 font-medium">Contoh Kata: </span>
                  <span className="font-serif font-bold text-stone-800 dark:text-stone-200">{stroke.example}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
