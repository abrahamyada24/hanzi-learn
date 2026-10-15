import type { LessonUnit } from '../types';

export const LESSON_UNITS: LessonUnit[] = [
  {
    id: 'unit-1',
    unitNumber: 1,
    title: 'Bab 1: Salam & Kesopanan',
    subtitle: 'Kata sapaan harian & etika dasar',
    icon: '👋',
    wordIds: [
      'hsk1-001', // 你好
      'hsk1-002', // 谢谢
      'hsk1-003', // 不客气
      'hsk1-004', // 再见
      'hsk1-005', // 对不起
      'hsk1-006', // 没关系
      'hsk1-007', // 请
      'hsk1-008', // 我
      'hsk1-009', // 你
      'hsk1-091'  // 叫
    ]
  },
  {
    id: 'unit-2',
    unitNumber: 2,
    title: 'Bab 2: Angka Dasar 1 - 10',
    subtitle: 'Mengenal goresan angka & berhitung',
    icon: '🔢',
    wordIds: [
      'hsk1-032', // 一
      'hsk1-033', // 二
      'hsk1-034', // 三
      'hsk1-035', // 四
      'hsk1-036', // 五
      'hsk1-037', // 六
      'hsk1-038', // 七
      'hsk1-039', // 八
      'hsk1-040', // 九
      'hsk1-041', // 十
      'hsk1-042'  // 零
    ]
  },
  {
    id: 'unit-3',
    unitNumber: 3,
    title: 'Bab 3: Kata Ganti & Bertanya',
    subtitle: 'Dia, mereka, apa, siapa, berapa',
    icon: '❓',
    wordIds: [
      'hsk1-010', // 他
      'hsk1-011', // 她
      'hsk1-012', // 我们
      'hsk1-013', // 这
      'hsk1-014', // 那
      'hsk1-015', // 哪
      'hsk1-016', // 谁
      'hsk1-017', // 什么
      'hsk1-018', // 怎么
      'hsk1-019', // 多少
      'hsk1-020'  // 几
    ]
  },
  {
    id: 'unit-4',
    unitNumber: 4,
    title: 'Bab 4: Waktu, Hari & Kalender',
    subtitle: 'Hari ini, besok, jam, menit, bulan',
    icon: '📅',
    wordIds: [
      'hsk1-043', // 今天
      'hsk1-044', // 明天
      'hsk1-045', // 昨天
      'hsk1-046', // 年
      'hsk1-047', // 月
      'hsk1-048', // 日
      'hsk1-049', // 星期
      'hsk1-050', // 点
      'hsk1-051', // 分钟
      'hsk1-052', // 现在
      'hsk1-053'  // 时候
    ]
  },
  {
    id: 'unit-5',
    unitNumber: 5,
    title: 'Bab 5: Orang, Keluarga & Profesi',
    subtitle: 'Ayah, ibu, guru, murid, dokter',
    icon: '👨‍👩‍👧',
    wordIds: [
      'hsk1-054', // 人
      'hsk1-055', // 爸爸
      'hsk1-056', // 妈妈
      'hsk1-057', // 儿子
      'hsk1-058', // 女儿
      'hsk1-059', // 老师
      'hsk1-060', // 学生
      'hsk1-061', // 同学
      'hsk1-062', // 朋友
      'hsk1-063', // 医生
      'hsk1-064', // 先生
      'hsk1-065'  // 小姐
    ]
  },
  {
    id: 'unit-6',
    unitNumber: 6,
    title: 'Bab 6: Makanan & Minuman',
    subtitle: 'Makan, minum, air, teh, nasi, sayur',
    icon: '🍜',
    wordIds: [
      'hsk1-066', // 水
      'hsk1-067', // 茶
      'hsk1-068', // 米饭
      'hsk1-069', // 菜
      'hsk1-070', // 苹果
      'hsk1-071', // 吃
      'hsk1-072', // 喝
      'hsk1-087', // 喜欢
      'hsk1-088'  // 想
    ]
  },
  {
    id: 'unit-7',
    unitNumber: 7,
    title: 'Bab 7: Aktivitas Sehari-hari',
    subtitle: 'Melihat, mendengar, bicara, menulis, baca',
    icon: '✍️',
    wordIds: [
      'hsk1-073', // 看
      'hsk1-074', // 听
      'hsk1-075', // 说
      'hsk1-076', // 写
      'hsk1-077', // 读
      'hsk1-078', // 做
      'hsk1-079', // 买
      'hsk1-085', // 学习
      'hsk1-086', // 工作
      'hsk1-089', // 爱
      'hsk1-090'  // 认识
    ]
  },
  {
    id: 'unit-8',
    unitNumber: 8,
    title: 'Bab 8: Perpindahan & Tempat',
    subtitle: 'Pergi, datang, pulang, sekolah, rumah, toko',
    icon: '🏫',
    wordIds: [
      'hsk1-080', // 去
      'hsk1-081', // 来
      'hsk1-082', // 回
      'hsk1-083', // 住
      'hsk1-084', // 坐
      'hsk1-110', // 家
      'hsk1-111', // 学校
      'hsk1-112', // 饭馆
      'hsk1-113', // 商店
      'hsk1-114', // 医院
      'hsk1-115', // 中国
      'hsk1-116'  // 北京
    ]
  },
  {
    id: 'unit-9',
    unitNumber: 9,
    title: 'Bab 9: Benda & Kehidupan',
    subtitle: 'Buku, komputer, TV, pakaian, uang, hewan',
    icon: '💻',
    wordIds: [
      'hsk1-097', // 书
      'hsk1-098', // 电脑
      'hsk1-099', // 电视
      'hsk1-100', // 电影
      'hsk1-101', // 衣服
      'hsk1-102', // 杯子
      'hsk1-103', // 桌子
      'hsk1-104', // 椅子
      'hsk1-105', // 钱
      'hsk1-106', // 飞机
      'hsk1-107', // 出租车
      'hsk1-108', // 猫
      'hsk1-109'  // 狗
    ]
  },
  {
    id: 'unit-10',
    unitNumber: 10,
    title: 'Bab 10: Sifat & Tata Bahasa Penting',
    subtitle: 'Bagus, besar, kecil, banyak, sangat, tidak',
    icon: '✨',
    wordIds: [
      'hsk1-021', // 不
      'hsk1-022', // 没
      'hsk1-023', // 很
      'hsk1-024', // 太
      'hsk1-025', // 都
      'hsk1-026', // 和
      'hsk1-027', // 在
      'hsk1-028', // 的
      'hsk1-029', // 了
      'hsk1-030', // 吗
      'hsk1-031', // 呢
      'hsk1-122', // 好
      'hsk1-123', // 大
      'hsk1-124', // 小
      'hsk1-125', // 多
      'hsk1-126', // 少
      'hsk1-127', // 冷
      'hsk1-128', // 热
      'hsk1-129', // 高兴
      'hsk1-130'  // 漂亮
    ]
  }
];
