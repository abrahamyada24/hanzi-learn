import type { CharacterStory } from '../types';

export const CHARACTER_STORIES: CharacterStory[] = [
  {
    id: 'char-ri',
    character: '日',
    pinyin: 'rì',
    meaning: 'Matahari / Hari',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '☉ (Bentuk lingkaran matahari dengan titik energi di tengahnya)',
    story: 'Zaman dahulu dipahat sebagai lingkaran bulat dengan titik api di tengahnya (☉). Karena menggores di atas batu atau tulang lebih mudah menggunakan garis lurus, bentuk bulatnya berubah menjadi kotak persegi panjang (日). Matahari terbit dan terbenam menandakan satu hari.',
    evolution: ['☉ (Tulisan Tulang Kuno)', '日 (Karakter Modern)'],
    sampleWords: [
      { word: '今天', pinyin: 'jīntiān', meaning: 'Hari ini' },
      { word: '明天', pinyin: 'míngtiān', meaning: 'Besok' },
      { word: '生日', pinyin: 'shēngrì', meaning: 'Ulang tahun' }
    ],
    tags: ['Alam', 'Dasar', 'Waktu']
  },
  {
    id: 'char-yue',
    character: '月',
    pinyin: 'yuè',
    meaning: 'Bulan (Rembulan / Bulan Kalender)',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '🌙 (Siluet bulan sabit di langit malam)',
    story: 'Menggambarkan bulan sabit yang melengkung indah. Dua garis horizontal di dalamnya melambangkan awan tipis atau bayangan kawah di permukaan rembulan. Perputaran bentuk bulan menjadi penanda waktu 1 bulan kalender.',
    evolution: ['🌙 (Tulisan Tulang Kuno)', '月 (Karakter Modern)'],
    sampleWords: [
      { word: '一月', pinyin: 'yī yuè', meaning: 'Bulan Januari' },
      { word: '月亮', pinyin: 'yuèliang', meaning: 'Bulan di langit' },
      { word: '上个月', pinyin: 'shàng ge yuè', meaning: 'Bulan lalu' }
    ],
    tags: ['Alam', 'Dasar', 'Waktu']
  },
  {
    id: 'char-ming',
    character: '明',
    pinyin: 'míng',
    meaning: 'Terang / Jelas / Pintar',
    type: 'Gabungan Logika (Asosiasi Ide)',
    pictogramOrigin: '日 (Matahari) + 月 (Bulan)',
    components: [
      { char: '日', meaning: 'Matahari (sumber cahaya siang)' },
      { char: '月', meaning: 'Bulan (sumber cahaya malam)' }
    ],
    story: 'Apa yang terjadi jika Matahari (日) dan Rembulan (月) disatukan berdampingan? Ruangan akan dipenuhi cahaya yang sangat terang benderang! Karakter ini juga dipakai untuk kata "besok" (明天 - hari baru saat matahari terbit kembali).',
    sampleWords: [
      { word: '明天', pinyin: 'míngtiān', meaning: 'Besok (hari yang terang berikutnya)' },
      { word: '明白', pinyin: 'míngbai', meaning: 'Paham / Jelas' },
      { word: '聪明', pinyin: 'cōngming', meaning: 'Pintar / Cerdas' }
    ],
    tags: ['Kombinasi', 'Waktu', 'Sifat']
  },
  {
    id: 'char-mu',
    character: '木',
    pinyin: 'mù',
    meaning: 'Pohon / Kayu',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '🌲 (Sebatang pohon dengan batang lurus, ranting di atas, dan akar di bawah)',
    story: 'Garis horizontal melambangkan dahan yang membentang ke samping, garis vertikal adalah batang pohon yang tegak, dan dua garis miring di bawahnya adalah akar yang menancap kokoh ke dalam tanah.',
    evolution: ['🌲 (Tulisan Kuno)', '木 (Karakter Modern)'],
    sampleWords: [
      { word: '木头', pinyin: 'mùtou', meaning: 'Kayu' },
      { word: '树木', pinyin: 'shùmù', meaning: 'Pepohonan' },
      { word: '桌子', pinyin: 'zhuōzi', meaning: 'Meja (perabot dari kayu)' }
    ],
    tags: ['Alam', 'Tumbuhan', 'Dasar']
  },
  {
    id: 'char-lin',
    character: '林',
    pinyin: 'lín',
    meaning: 'Hutan Kecil / Belantara',
    type: 'Gabungan Logika (Asosiasi Ide)',
    pictogramOrigin: '木 (Pohon) + 木 (Pohon)',
    components: [
      { char: '木', meaning: 'Pohon pertama' },
      { char: '木', meaning: 'Pohon kedua' }
    ],
    story: 'Jika satu pohon (木) berdiri sendiri, itu hanyalah pohon. Namun saat ada dua pohon tumbuh berdampingan (木 + 木 = 林), mulailah terbentuk hutan kecil (*woods/grove*).',
    sampleWords: [
      { word: '树林', pinyin: 'shùlín', meaning: 'Hutan pepohonan' },
      { word: '森林', pinyin: 'sēnlín', meaning: 'Hutan rimba' }
    ],
    tags: ['Alam', 'Tumbuhan', 'Kombinasi']
  },
  {
    id: 'char-sen',
    character: '森',
    pinyin: 'sēn',
    meaning: 'Hutan Lebat / Rimba',
    type: 'Gabungan Logika (Asosiasi Ide)',
    pictogramOrigin: 'Tiga pohon (木) bertumpuk membentuk segitiga',
    components: [
      { char: '木', meaning: 'Pohon atas' },
      { char: '木', meaning: 'Pohon kiri' },
      { char: '木', meaning: 'Pohon kanan' }
    ],
    story: 'Ketika pohon bertambah menjadi tiga (satu di atas, dua di bawah), tempat itu sudah menjadi hutan belantara yang sangat lebat dan rimbun (*forest*). Konsep ini mengajarkan bahwa dalam budaya Hanzi kuno, angka "tiga" melambangkan "sangat banyak".',
    sampleWords: [
      { word: '森林', pinyin: 'sēnlín', meaning: 'Hutan rimba / Belantara lebat' }
    ],
    tags: ['Alam', 'Tumbuhan', 'Kombinasi']
  },
  {
    id: 'char-ren',
    character: '人',
    pinyin: 'rén',
    meaning: 'Orang / Manusia',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '🚶 (Siluet samping seseorang yang sedang melangkah)',
    story: 'Dua goresan sederhana melambangkan dua kaki manusia yang sedang melangkah maju dengan kepala menunduk penuh kerendahan hati. Ketika menjadi radikal di samping karakter lain, bentuknya disederhanakan menjadi "亻" (rénpáng).',
    evolution: ['🚶 (Tulisan Kuno)', '人 / 亻 (Karakter Modern)'],
    sampleWords: [
      { word: '中国人', pinyin: 'Zhōngguó rén', meaning: 'Orang Tiongkok' },
      { word: '人们', pinyin: 'rénmen', meaning: 'Orang-orang' },
      { word: '大人', pinyin: 'dàrén', meaning: 'Orang dewasa' }
    ],
    tags: ['Orang', 'Dasar']
  },
  {
    id: 'char-xiu',
    character: '休',
    pinyin: 'xiū',
    meaning: 'Istirahat / Berhenti',
    type: 'Gabungan Logika (Asosiasi Ide)',
    pictogramOrigin: '亻(Manusia) + 木 (Pohon)',
    components: [
      { char: '亻', meaning: 'Orang / Manusia' },
      { char: '木', meaning: 'Pohon' }
    ],
    story: 'Bayangkan seorang petani di zaman kuno yang lelah mencangkul di sawah terik. Dia kemudian berjalan ke bawah sebatang pohon rindang (木) dan menyandarkan tubuhnya (亻) di sana untuk berteduh dan melepas lelah. Itulah arti dari "Istirahat" (休)!',
    sampleWords: [
      { word: '休息', pinyin: 'xiūxi', meaning: 'Beristirahat' },
      { word: '休假', pinyin: 'xiūjià', meaning: 'Cuti / Libur kerja' }
    ],
    tags: ['Aktivitas', 'Kombinasi']
  },
  {
    id: 'char-nv',
    character: '女',
    pinyin: 'nǚ',
    meaning: 'Wanita / Perempuan',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '👩 (Sosok wanita yang sedang bersimpuh dengan tangan terlipat di depan)',
    story: 'Menggambarkan posisi duduk bersimpuh tradisional seorang wanita zaman dahulu yang tenang dan anggun. Menjadi radikal penting untuk karakter yang berhubungan dengan kecantikan, keluarga, dan ibu.',
    sampleWords: [
      { word: '女人', pinyin: 'nǚrén', meaning: 'Wanita / Perempuan' },
      { word: '女儿', pinyin: 'nǚ\'ér', meaning: 'Anak perempuan' },
      { word: '女朋友', pinyin: 'nǚpéngyou', meaning: 'Pacar perempuan' }
    ],
    tags: ['Orang', 'Keluarga', 'Dasar']
  },
  {
    id: 'char-zi',
    character: '子',
    pinyin: 'zǐ',
    meaning: 'Anak / Bayi',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '👶 (Bayi dengan kepala besar dan tangan terentang)',
    story: 'Bagian atas melambangkan kepala bayi yang membulat, garis horizontal melambangkan kedua tangan kecilnya yang terbuka minta digendong, dan bagian bawah adalah kaki yang terbungkus kain bedong.',
    sampleWords: [
      { word: '儿子', pinyin: 'érzi', meaning: 'Anak laki-laki' },
      { word: '孩子', pinyin: 'háizi', meaning: 'Anak kecil' },
      { word: '桌子', pinyin: 'zhuōzi', meaning: 'Meja (akhiran kata benda)' }
    ],
    tags: ['Orang', 'Keluarga', 'Dasar']
  },
  {
    id: 'char-hao',
    character: '好',
    pinyin: 'hǎo',
    meaning: 'Baik / Bagus / Senang',
    type: 'Gabungan Logika (Asosiasi Ide)',
    pictogramOrigin: '女 (Wanita / Ibu) + 子 (Anak)',
    components: [
      { char: '女', meaning: 'Seorang ibu / wanita' },
      { char: '子', meaning: 'Seorang anak' }
    ],
    story: 'Bagi masyarakat Tiongkok kuno, pemandangan paling membahagiakan dan damai di dunia adalah melihat seorang ibu (女) memeluk anaknya (子) dengan penuh kasih sayang. Dari situlah kata "BAIK / BAGUS" (好) tercipta!',
    sampleWords: [
      { word: '你好', pinyin: 'nǐ hǎo', meaning: 'Halo (Semoga kamu baik)' },
      { word: '很好', pinyin: 'hěn hǎo', meaning: 'Sangat bagus / Sangat baik' },
      { word: '好吃', pinyin: 'hǎochī', meaning: 'Enak / Lezat' }
    ],
    tags: ['Salam', 'Sifat', 'Kombinasi']
  },
  {
    id: 'char-kou',
    character: '口',
    pinyin: 'kǒu',
    meaning: 'Mulut / Lubang Masuk',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '👄 (Bentuk bibir dan rongga mulut yang terbuka)',
    story: 'Bentuk kotak sederhana yang melambangkan rongga mulut terbuka. Radikal "口" ini menempel pada hampir semua aktivitas yang melibatkan mulut: makan (吃), minum (喝), memanggil (叫), bertanya (问), bernyanyi (唱).',
    sampleWords: [
      { word: '人口', pinyin: 'rénkǒu', meaning: 'Jumlah penduduk (populasi mulut yang makan)' },
      { word: '门口', pinyin: 'ménkǒu', meaning: 'Pintu gerbang / Pintu masuk' },
      { word: '吃', pinyin: 'chī', meaning: 'Makan (ada radikal 口 di kiri)' }
    ],
    tags: ['Tubuh', 'Dasar']
  },
  {
    id: 'char-pin',
    character: '品',
    pinyin: 'pǐn',
    meaning: 'Kualitas / Barang / Mencicipi',
    type: 'Gabungan Logika (Asosiasi Ide)',
    pictogramOrigin: 'Tiga mulut (口) tersusun',
    components: [
      { char: '口', meaning: 'Mulut penilai 1' },
      { char: '口', meaning: 'Mulut penilai 2' },
      { char: '口', meaning: 'Mulut penilai 3' }
    ],
    story: 'Jika hanya satu mulut memuji makanan, mungkin itu kebetulan. Tetapi jika tiga mulut (口 + 口 + 口) semuanya mencicipi dan setuju memujinya, maka barang atau makanan itu benar-benar memiliki "KUALITAS TINGGI" (品质)!',
    sampleWords: [
      { word: '商品', pinyin: 'shāngpǐn', meaning: 'Barang dagangan / Produk' },
      { word: '作品', pinyin: 'zuòpǐn', meaning: 'Karya seni / Buku' }
    ],
    tags: ['Benda', 'Kombinasi']
  },
  {
    id: 'char-huo',
    character: '火',
    pinyin: 'huǒ',
    meaning: 'Api / Panas',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '🔥 (Kobaran lidah api dengan percikan bara)',
    story: 'Garis tengah yang menjulang ke atas adalah lidah api utama yang berkobar, sedangkan dua goresan di kiri dan kanannya adalah percikan bunga api yang meletup. Jika diletakkan di bawah karakter lain, bentuknya berubah menjadi empat titik bara: 灬 (seperti pada 熱 / 热 = panas).',
    sampleWords: [
      { word: '火车', pinyin: 'huǒchē', meaning: 'Kereta api (mobil yang ditenagai api uap)' },
      { word: '热', pinyin: 'rè', meaning: 'Panas (memiliki radikal api 灬 di bawah)' }
    ],
    tags: ['Alam', 'Elemen', 'Dasar']
  },
  {
    id: 'char-yan',
    character: '炎',
    pinyin: 'yán',
    meaning: 'Sangat Panas / Meradang / Kobaran Api',
    type: 'Gabungan Logika (Asosiasi Ide)',
    pictogramOrigin: '火 (Api) + 火 (Api) bertumpuk',
    components: [
      { char: '火', meaning: 'Api atas' },
      { char: '火', meaning: 'Api bawah' }
    ],
    story: 'Satu api (火) sudah panas. Ketika dua kobaran api ditumpuk satu di atas yang lain (火 + 火 = 炎), panasnya menjadi berlipat ganda! Dalam istilah medis, karakter ini berarti radang / inflamasi.',
    sampleWords: [
      { word: '炎热', pinyin: 'yánrè', meaning: 'Sangat panas terik' },
      { word: '发炎', pinyin: 'fāyán', meaning: 'Mengalami radang / Infeksi panas' }
    ],
    tags: ['Alam', 'Elemen', 'Kombinasi']
  },
  {
    id: 'char-shan',
    character: '山',
    pinyin: 'shān',
    meaning: 'Gunung',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '⛰️ (Tiga puncak gunung berjejer)',
    story: 'Puncak tengah yang paling tinggi melambangkan puncak gunung utama, dan dua garis tegak di sampingnya adalah lereng atau bukit-bukit tetangga yang bersambungan di satu punggungan tanah mendatar di bawahnya.',
    sampleWords: [
      { word: '爬山', pinyin: 'pá shān', meaning: 'Mendaki gunung' },
      { word: '火山', pinyin: 'huǒshān', meaning: 'Gunung berapi' }
    ],
    tags: ['Alam', 'Dasar']
  },
  {
    id: 'char-shui',
    character: '水',
    pinyin: 'shuǐ',
    meaning: 'Air / Sungai',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '💧 (Aliran air sungai yang mengalir diapit riak gelombang)',
    story: 'Garis tengah meliuk melambangkan arus deras sungai utama, sedangkan titik dan goresan di kiri-kanannya melambangkan riak pusaran air. Ketika berada di samping karakter lain, ditulis sebagai radikal tiga titik air: 氵 (seperti di 冷 = dingin, 没 = tidak ada/tenggelam, 汉 = mandarin).',
    sampleWords: [
      { word: '喝水', pinyin: 'hē shuǐ', meaning: 'Minum air' },
      { word: '水果', pinyin: 'shuǐguǒ', meaning: 'Buah-buahan (buah yang berair manis)' }
    ],
    tags: ['Alam', 'Elemen', 'Dasar']
  },
  {
    id: 'char-tian',
    character: '田',
    pinyin: 'tián',
    meaning: 'Sawah / Ladang',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '🌾 (Petak-petak sawah berpagar dengan pematang pembagi saluran air)',
    story: 'Kotak besar melambangkan batas lahan pertanian, dan tanda tambah (+) di dalamnya adalah pematang atau parit pembagi saluran irigasi agar padi terairi rata.',
    sampleWords: [
      { word: '田地', pinyin: 'tiándì', meaning: 'Lahan sawah / Ladang pertanian' }
    ],
    tags: ['Pertanian', 'Dasar']
  },
  {
    id: 'char-li',
    character: '力',
    pinyin: 'lì',
    meaning: 'Tenaga / Kekuatan',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '💪 (Bentuk otot lengan yang kuat atau bajak pembajak tanah tradisional)',
    story: 'Menggambarkan otot lengan manusia yang menekuk saat mengerahkan seluruh daya kekuatannya.',
    sampleWords: [
      { word: '力量', pinyin: 'lìliang', meaning: 'Kekuatan fisik' },
      { word: '努力', pinyin: 'nǔlì', meaning: 'Bekerja keras / Berusaha kuat' }
    ],
    tags: ['Tubuh', 'Dasar']
  },
  {
    id: 'char-nan',
    character: '男',
    pinyin: 'nán',
    meaning: 'Laki-laki / Pria',
    type: 'Gabungan Logika (Asosiasi Ide)',
    pictogramOrigin: '田 (Sawah) + 力 (Tenaga)',
    components: [
      { char: '田', meaning: 'Sawah / Ladang di atas' },
      { char: '力', meaning: 'Tenaga / Kekuatan otot di bawah' }
    ],
    story: 'Siapakah orang yang mengerahkan seluruh tenaga dan otot fisiknya (力) untuk mencangkul dan membajak sawah (田) di bawah terik matahari? Tentu saja kaum PRIA (男)! Logika yang sangat brilian dari zaman agraris kuno.',
    sampleWords: [
      { word: '男人', pinyin: 'nánrén', meaning: 'Laki-laki / Pria' },
      { word: '男生', pinyin: 'nánshēng', meaning: 'Murid laki-laki' },
      { word: '男朋友', pinyin: 'nánpéngyou', meaning: 'Pacar laki-laki' }
    ],
    tags: ['Orang', 'Kombinasi']
  },
  {
    id: 'char-men',
    character: '门',
    pinyin: 'mén',
    meaning: 'Pintu / Gerbang',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '🚪 (Dua daun pintu gerbang masuk tradisional)',
    story: 'Versi kunonya (門) memperlihatkan dua tiang kusen dan dua daun pintu kayu yang simetris. Pada karakter yang disederhanakan modern (门), bentuknya tetap mempertahankan siluet kusen pintu yang kokoh.',
    sampleWords: [
      { word: '开门', pinyin: 'kāi mén', meaning: 'Membuka pintu' },
      { word: '门口', pinyin: 'ménkǒu', meaning: 'Pintu gerbang / Mulut jalan' }
    ],
    tags: ['Bangunan', 'Dasar']
  },
  {
    id: 'char-wen',
    character: '问',
    pinyin: 'wèn',
    meaning: 'Bertanya',
    type: 'Gabungan Logika (Asosiasi Ide)',
    pictogramOrigin: '门 (Pintu) + 口 (Mulut)',
    components: [
      { char: '门', meaning: 'Pintu rumah / Pintu gerbang' },
      { char: '口', meaning: 'Mulut yang bersuara di dalam' }
    ],
    story: 'Ketika kamu bertamu ke rumah tetangga yang pintunya masih tertutup (门), apa yang kamu lakukan? Kamu membuka mulutmu (口) di balik pintu untuk berseru: "Halo, apakah ada orang di dalam?". Itulah asal mula kata "BERTANYA" (问)!',
    sampleWords: [
      { word: '请问', pinyin: 'qǐngwèn', meaning: 'Permisi, bolehkah saya bertanya?' },
      { word: '问题', pinyin: 'wèntí', meaning: 'Pertanyaan / Masalah' }
    ],
    tags: ['Aktivitas', 'Kombinasi']
  },
  {
    id: 'char-kan',
    character: '看',
    pinyin: 'kàn',
    meaning: 'Melihat / Menonton / Membaca',
    type: 'Gabungan Logika (Asosiasi Ide)',
    pictogramOrigin: '手 (Tangan di atas) + 目 (Mata di bawah)',
    components: [
      { char: '手 (disingkat ⺪)', meaning: 'Tangan' },
      { char: '目', meaning: 'Mata' }
    ],
    story: 'Ketika sinar matahari terlalu terik menyilaukan dan kamu ingin melihat sesuatu di kejauhan, apa gerakan refleksmu? Kamu menaruh tanganmu (手) mendatar di atas alismu tepat di atas matamu (目) untuk memayungi pandanganmu. Itulah aksi "MELIHAT" (看)!',
    sampleWords: [
      { word: '看书', pinyin: 'kàn shū', meaning: 'Membaca buku' },
      { word: '看电影', pinyin: 'kàn diànyǐng', meaning: 'Menonton film' },
      { word: '看见', pinyin: 'kànjiàn', meaning: 'Melihat' }
    ],
    tags: ['Aktivitas', 'Kombinasi']
  },
  {
    id: 'char-dian',
    character: '电',
    pinyin: 'diàn',
    meaning: 'Kilat / Listrik',
    type: 'Piktogram (Gambar Benda)',
    pictogramOrigin: '⚡ (Kilatan petir yang menyambar dari awan mendung)',
    story: 'Zaman dulu petir ditulis di bawah awan hujan (雨). Karakter disederhanakan menampilkan garis kotak awan dengan ekor zigzag petir yang meliuk ke bawah. Sekarang "电" adalah kata untuk segala teknologi listrik modern!',
    sampleWords: [
      { word: '电脑', pinyin: 'diànnǎo', meaning: 'Komputer (Listrik + Otak = Otak Listrik)' },
      { word: '电视', pinyin: 'diànshì', meaning: 'Televisi (Penglihatan Listrik)' },
      { word: '电影', pinyin: 'diànyǐng', meaning: 'Film / Bioskop (Bayangan Listrik)' },
      { word: '电话', pinyin: 'diànhuà', meaning: 'Telepon (Ucapan Listrik)' }
    ],
    tags: ['Alam', 'Teknologi', 'Dasar']
  }
];
