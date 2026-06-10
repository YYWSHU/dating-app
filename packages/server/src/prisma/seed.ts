import { PrismaClient, Gender, InterestedIn } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data (order matters for FK constraints)
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.like.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing data\n');

  const password = await bcrypt.hash('123456', 12);

  const users = [
    // ===== 北京 (39.90, 116.40) — 核心区域 =====
    {
      email: 'alice@test.com',
      password,
      nickname: 'Alice',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('1998-05-15'),
      bio: '喜欢旅行和美食，期待遇见有趣的灵魂 ☕',
      tags: ['旅行', '美食', '摄影', '瑜伽'],
      latitude: 39.9042,
      longitude: 116.4074,
    },
    {
      email: 'bob@test.com',
      password,
      nickname: 'Bob',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1996-08-22'),
      bio: '程序员一枚，热爱户外运动和音乐 🎸',
      tags: ['编程', '户外', '音乐', '健身'],
      latitude: 39.9142,
      longitude: 116.4174,
    },
    {
      email: 'carol@test.com',
      password,
      nickname: 'Carol',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('1999-01-10'),
      bio: '文艺青年，喜欢读书和画画 📚',
      tags: ['读书', '画画', '咖啡', '猫'],
      latitude: 39.9242,
      longitude: 116.3974,
    },
    {
      email: 'dave@test.com',
      password,
      nickname: 'Dave',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1995-03-18'),
      bio: '健身教练，阳光开朗大男孩 💪',
      tags: ['健身', '篮球', '烹饪', '电影'],
      latitude: 39.9342,
      longitude: 116.4274,
    },
    {
      email: 'eve@test.com',
      password,
      nickname: 'Eve',
      gender: Gender.female,
      interestedIn: InterestedIn.both,
      birthDate: new Date('1997-11-30'),
      bio: '自由职业设计师，热爱生活 🎨',
      tags: ['设计', '旅行', '美食', '电影'],
      latitude: 39.9042,
      longitude: 116.3874,
    },

    // ===== 北京 — 朝阳/国贸 年轻职场人群 =====
    {
      email: 'luna@test.com',
      password,
      nickname: 'Luna 月亮',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('2000-07-20'),
      bio: '互联网大厂产品经理，周末爱逛胡同和咖啡馆，有一只叫团子的英短 🐱',
      tags: ['咖啡', '猫', '探店', '脱口秀', '骑行'],
      latitude: 39.9219,
      longitude: 116.4435,
    },
    {
      email: 'mike@test.com',
      password,
      nickname: 'Mike 小麦',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1997-02-14'),
      bio: 'VC 投资人，理性与感性并存。周末喜欢爬山和吃火锅 🍲',
      tags: ['登山', '火锅', '投资', '哲学', '滑雪'],
      latitude: 39.9289,
      longitude: 116.4583,
    },
    {
      email: 'sophie@test.com',
      password,
      nickname: 'Sophie 苏菲',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('2001-09-05'),
      bio: '新晋律师，独立自信。工作日西装革履，周末练钢管舞 💃',
      tags: ['舞蹈', '红酒', '辩论', '悬疑小说'],
      latitude: 39.9150,
      longitude: 116.4550,
    },
    {
      email: 'ryan@test.com',
      password,
      nickname: 'Ryan',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1994-12-03'),
      bio: '连续创业者，目前第三次创业中。会做饭的男人运气不会太差 🍳',
      tags: ['创业', '烹饪', '爵士乐', '摄影', '冥想'],
      latitude: 39.9350,
      longitude: 116.4370,
    },

    // ===== 北京 — 海淀 高校/科研圈 =====
    {
      email: 'emma@test.com',
      password,
      nickname: 'Emma 小雅',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('2002-03-28'),
      bio: '清华计算机研二在读，研究 NLP 方向。打游戏很厉害的女生 🎮',
      tags: ['AI', '游戏', '动漫', 'LeetCode', '奶茶'],
      latitude: 39.9930,
      longitude: 116.3260,
    },
    {
      email: 'jason@test.com',
      password,
      nickname: 'Jason 杰森',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1995-06-15'),
      bio: '中科院博士，研究量子计算。别被简历吓到，生活中是段子手 😂',
      tags: ['物理', '段子', '桌游', 'bouldering', '精酿啤酒'],
      latitude: 39.9810,
      longitude: 116.3390,
    },
    {
      email: 'nina@test.com',
      password,
      nickname: 'Nina 妮娜',
      gender: Gender.female,
      interestedIn: InterestedIn.both,
      birthDate: new Date('2000-10-10'),
      bio: '北大医学院，未来的儿科医生。喜欢小朋友和小动物 👶🐶',
      tags: ['医学', '志愿者', '烘焙', '小提琴', '植物'],
      latitude: 39.9860,
      longitude: 116.3030,
    },

    // ===== 北京 — 通州/亦庄 新城青年 =====
    {
      email: 'kevin@test.com',
      password,
      nickname: 'Kevin',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1993-04-09'),
      bio: '汽车工程师，爱车如命。周末开车去郊外露营是最大的乐趣 🏕️',
      tags: ['汽车', '露营', '公路旅行', '摄影', '改装'],
      latitude: 39.8900,
      longitude: 116.6200,
    },
    {
      email: 'mia@test.com',
      password,
      nickname: 'Mia 米娅',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('1999-07-25'),
      bio: '跨境电商运营，居家办公。希望找到能一起做饭看电影的人 🎬',
      tags: ['烹饪', '电影', '手账', '收纳', 'J-POP'],
      latitude: 39.8800,
      longitude: 116.6000,
    },
    {
      email: 'oscar@test.com',
      password,
      nickname: 'Oscar',
      gender: Gender.male,
      interestedIn: InterestedIn.male,
      birthDate: new Date('1996-11-11'),
      bio: '建筑师，审美在线。喜欢逛美术馆和设计展，也是半个美食博主 📸',
      tags: ['建筑', '艺术展', '美食', '威士忌', '旅行'],
      latitude: 39.8950,
      longitude: 116.4950,
    },
    {
      email: 'zara@test.com',
      password,
      nickname: 'Zara 扎扎',
      gender: Gender.female,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1998-02-18'),
      bio: 'UI 设计师，极简主义者。一个人的时候喜欢拼乐高和听播客 🎧',
      tags: ['设计', '乐高', '播客', '极简', '冲浪'],
      latitude: 39.9100,
      longitude: 116.4300,
    },

    // ===== 北京 — 30+ 成熟群体 =====
    {
      email: 'grace@test.com',
      password,
      nickname: 'Grace 格蕾丝',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('1990-01-20'),
      bio: '画廊策展人，去过40+个国家。人生下半场，想找一个人一起看展喝茶 🌿',
      tags: ['艺术', '茶道', '旅行', '古典乐', '文学'],
      latitude: 39.9180,
      longitude: 116.4150,
    },
    {
      email: 'frank@test.com',
      password,
      nickname: 'Frank',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1988-09-30'),
      bio: '外科医生，工作很忙但会留时间给重要的人。养了一只金毛 🦮',
      tags: ['医学', '养狗', '跑步', '纪录片', '围棋'],
      latitude: 39.9300,
      longitude: 116.4000,
    },
    {
      email: 'helen@test.com',
      password,
      nickname: 'Helen 海伦',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('1991-06-06'),
      bio: '前四大审计，现在做财务顾问。外表高冷内心柔软，喜欢成熟稳重的男生',
      tags: ['理财', '高尔夫', '红酒', '话剧', '滑雪'],
      latitude: 39.9220,
      longitude: 116.4420,
    },

    // ===== 上海 (31.23, 121.47) =====
    {
      email: 'lucas@test.com',
      password,
      nickname: 'Lucas 路卡斯',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1997-08-08'),
      bio: '魔都土著，广告公司创意总监。喜欢小资生活和法租界的梧桐树 🍂',
      tags: ['广告', 'brunch', 'fashion', '黑胶唱片', '网球'],
      latitude: 31.2304,
      longitude: 121.4737,
    },
    {
      email: 'ivy@test.com',
      password,
      nickname: 'Ivy 常春藤',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('2000-05-22'),
      bio: '上外毕业，同声传译。对语言学有执念，能聊三小时方言演化',
      tags: ['语言学', 'jazz', '翻译', '瑜伽', '素食'],
      latitude: 31.2420,
      longitude: 121.4850,
    },
    {
      email: 'tom@test.com',
      password,
      nickname: 'Tom 汤姆',
      gender: Gender.male,
      interestedIn: InterestedIn.both,
      birthDate: new Date('1994-03-15'),
      bio: '自由摄影师，接商业拍摄养活自己。生活很简单，一台相机一个人 📷',
      tags: ['摄影', '电影', '咖啡', '自由职业', '纹身'],
      latitude: 31.2150,
      longitude: 121.4600,
    },

    // ===== 深圳 (22.54, 114.06) =====
    {
      email: 'ava@test.com',
      password,
      nickname: 'Ava 艾娃',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('2001-01-01'),
      bio: '腾讯产品经理，卷王本王。其实内心也想要甜甜的恋爱 🍬',
      tags: ['互联网', '健身', '剧本杀', 'KPOP', '盲盒'],
      latitude: 22.5431,
      longitude: 114.0579,
    },
    {
      email: 'derek@test.com',
      password,
      nickname: 'Derek',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1996-07-07'),
      bio: '硬件工程师，华强北老油条。业余做智能家居极客 🏠',
      tags: ['DIY', '智能家居', '无人机', '骑行', '电子音乐'],
      latitude: 22.5470,
      longitude: 114.0650,
    },

    // ===== 杭州 (30.27, 120.15) =====
    {
      email: 'chloe@test.com',
      password,
      nickname: 'Chloe 克洛伊',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('1999-04-17'),
      bio: '阿里设计师，在杭州买了房。希望找一个在杭州发展的男生，一起逛西湖 🌸',
      tags: ['设计', '汉服', '茶文化', '书法', '古筝'],
      latitude: 30.2741,
      longitude: 120.1551,
    },
    {
      email: 'eric@test.com',
      password,
      nickname: 'Eric',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1995-10-28'),
      bio: '网易游戏策划，深度二次元。如果能接受我沉迷游戏就太好了 🎮',
      tags: ['游戏', '动漫', '手办', '电音', '拉面'],
      latitude: 30.2850,
      longitude: 120.1450,
    },

    // ===== 成都 (30.57, 104.07) =====
    {
      email: 'fiona@test.com',
      password,
      nickname: 'Fiona 小菲',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('1998-12-12'),
      bio: '不想当网红的咖啡馆老板。在成都开了一家猫咖，生活巴适得很 🐈☕',
      tags: ['咖啡', '猫', '烘焙', '民谣', '自驾'],
      latitude: 30.5728,
      longitude: 104.0668,
    },
    {
      email: 'hank@test.com',
      password,
      nickname: 'Hank',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1993-05-20'),
      bio: '退役电竞选手，现在是教练。曾经拿过全国冠军，现在只想安稳过日子',
      tags: ['电竞', '火锅', '篮球', '麻将', '宠物'],
      latitude: 30.5800,
      longitude: 104.0550,
    },

    // ===== 广州 (23.13, 113.26) =====
    {
      email: 'iris@test.com',
      password,
      nickname: 'Iris 鸢尾',
      gender: Gender.female,
      interestedIn: InterestedIn.male,
      birthDate: new Date('2000-08-30'),
      bio: '粤语母语，电台主播。希望遇到听得懂我冷笑话的人 🎙️',
      tags: ['播音', '粤语', '港剧', '早茶', '潜水'],
      latitude: 23.1291,
      longitude: 113.2644,
    },
    {
      email: 'nick@test.com',
      password,
      nickname: 'Nick',
      gender: Gender.male,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1992-02-29'),
      bio: '4年才过一次生日的海归，金融男。伦敦政经毕业，现居广州 🏦',
      tags: ['金融', '威士忌', '高尔夫', '古典乐', 'F1'],
      latitude: 23.1350,
      longitude: 113.2700,
    },

    // ===== 更多元的选择 =====
    {
      email: 'quinn@test.com',
      password,
      nickname: 'Quinn',
      gender: Gender.other,
      interestedIn: InterestedIn.both,
      birthDate: new Date('2001-06-01'),
      bio: '独立音乐人，对性别标签无感。作品在网易云有50万播放 🎵',
      tags: ['音乐', '创作', 'LGBTQ+', '素食', '冥想'],
      latitude: 39.9080,
      longitude: 116.4130,
    },
    {
      email: 'willow@test.com',
      password,
      nickname: 'Willow 柳',
      gender: Gender.female,
      interestedIn: InterestedIn.female,
      birthDate: new Date('1997-04-25'),
      bio: '瑜伽教练，也是业余诗人。在胡同里开了一个小小的瑜伽工作室 🧘',
      tags: ['瑜伽', '诗歌', '有机食品', '可持续', '陶艺'],
      latitude: 39.9400,
      longitude: 116.3900,
    },
    {
      email: 'peter@test.com',
      password,
      nickname: 'Peter',
      gender: Gender.male,
      interestedIn: InterestedIn.male,
      birthDate: new Date('1990-06-20'),
      bio: '在投行工作了10年，去年出柜。现在想找一个人一起经营生活 🌈',
      tags: ['金融', '烹饪', '健身', '品酒', '旅行'],
      latitude: 39.9250,
      longitude: 116.4450,
    },
  ];

  const createdUsers: Array<{ id: string; email: string; nickname: string }> = [];

  for (const userData of users) {
    const user = await prisma.user.create({ data: userData });
    createdUsers.push({ id: user.id, email: user.email, nickname: user.nickname });
    console.log(`  ✅ ${user.nickname} (${user.email})`);
  }

  console.log(`\n📊 Created ${createdUsers.length} users\n`);

  // ===== 创建一些预存的 Like 关系 =====
  console.log('💕 Creating pre-existing likes...');

  const likes: Array<[string, string]> = [
    // Alice likes some guys
    ['alice@test.com', 'bob@test.com'],
    ['alice@test.com', 'mike@test.com'],
    ['alice@test.com', 'jason@test.com'],
    // Bob likes some girls
    ['bob@test.com', 'alice@test.com'],  // mutual!
    ['bob@test.com', 'luna@test.com'],
    ['bob@test.com', 'sophie@test.com'],
    // Carol likes some guys
    ['carol@test.com', 'ryan@test.com'],
    ['carol@test.com', 'kevin@test.com'],
    ['carol@test.com', 'frank@test.com'],
    // Dave likes some girls
    ['dave@test.com', 'eve@test.com'],
    ['dave@test.com', 'mia@test.com'],
    ['dave@test.com', 'emma@test.com'],
    // Mike likes back
    ['mike@test.com', 'alice@test.com'],  // mutual!
    // Eve likes both
    ['eve@test.com', 'zara@test.com'],
    ['eve@test.com', 'dave@test.com'],  // mutual!
    // Ryan likes Carol back
    ['ryan@test.com', 'carol@test.com'],  // mutual!
    // Luna likes some guys
    ['luna@test.com', 'jason@test.com'],
    ['luna@test.com', 'oscar@test.com'],
    // Oscar likes Peter
    ['oscar@test.com', 'peter@test.com'],
    // Zara likes some girls
    ['zara@test.com', 'eve@test.com'],  // mutual!
    ['zara@test.com', 'willow@test.com'],
    // Quinn likes various
    ['quinn@test.com', 'tom@test.com'],
    ['quinn@test.com', 'nina@test.com'],
  ];

  const userMap = new Map(createdUsers.map((u) => [u.email, u.id]));

  for (const [likerEmail, likedEmail] of likes) {
    const likerId = userMap.get(likerEmail)!;
    const likedId = userMap.get(likedEmail)!;
    try {
      await prisma.like.create({ data: { likerId, likedId } });
    } catch {
      // ignore duplicates
    }
  }
  console.log(`  ✅ Created ${likes.length} like relationships\n`);

  // ===== 创建双向 Match =====
  console.log('💘 Creating pre-existing matches...');

  const mutualPairs: Array<[string, string]> = [
    ['alice@test.com', 'bob@test.com'],   // mutual likes
    ['alice@test.com', 'mike@test.com'],   // mutual likes
    ['carol@test.com', 'ryan@test.com'],   // mutual likes
    ['dave@test.com', 'eve@test.com'],    // mutual likes
    ['eve@test.com', 'zara@test.com'],    // mutual likes
  ];

  for (const [email1, email2] of mutualPairs) {
    const id1 = userMap.get(email1)!;
    const id2 = userMap.get(email2)!;
    const [user1Id, user2Id] = [id1, id2].sort();
    try {
      await prisma.match.create({ data: { user1Id, user2Id } });
    } catch {
      // ignore duplicates
    }
  }
  console.log(`  ✅ Created ${mutualPairs.length} matches\n`);

  // ===== 为匹配的用户创建一些消息 =====
  console.log('💬 Creating sample conversations...');

  const conversations: Array<{
    emails: [string, string];
    messages: Array<{ sender: string; content: string }>;
  }> = [
    {
      emails: ['alice@test.com', 'bob@test.com'],
      messages: [
        { sender: 'bob@test.com', content: 'Hi Alice！看到你也喜欢旅行，最近去了哪里呀？' },
        { sender: 'alice@test.com', content: 'Hi Bob！刚从云南回来，去了大理和丽江，太美了 🌸' },
        { sender: 'bob@test.com', content: '哇，我一直想去！有什么推荐的地方吗？' },
        { sender: 'alice@test.com', content: '一定要去洱海边骑车，然后去沙溪古镇住几天，超级治愈' },
        { sender: 'bob@test.com', content: '听起来太棒了！要不...下次一起去？我可以当你的摄影师 📸' },
        { sender: 'alice@test.com', content: '哈哈好啊，看你的照片技术在不在线 😉' },
      ],
    },
    {
      emails: ['dave@test.com', 'eve@test.com'],
      messages: [
        { sender: 'dave@test.com', content: 'Eve你好！你的作品集真的很有风格 👍' },
        { sender: 'eve@test.com', content: '谢谢你Dave！听说你是健身教练，我最近刚开始力量训练' },
        { sender: 'dave@test.com', content: '那太棒了！刚开始的话一定要注意动作标准，不然容易受伤' },
        { sender: 'eve@test.com', content: '对啊我就是怕这个...你有推荐的教程吗？' },
        { sender: 'dave@test.com', content: '我可以带你练一节课，免费体验 😊 我在朝阳大悦城附近' },
      ],
    },
    {
      emails: ['carol@test.com', 'ryan@test.com'],
      messages: [
        { sender: 'ryan@test.com', content: 'Carol，你画的那幅水彩好好看' },
        { sender: 'carol@test.com', content: '谢谢！那是上周末在胡同里写生的' },
        { sender: 'ryan@test.com', content: '我也喜欢逛胡同！不过我是去拍照的，纪实摄影' },
        { sender: 'carol@test.com', content: '那下次可以一起去，你拍照我画画 🎨📷' },
      ],
    },
  ];

  for (const { emails, messages } of conversations) {
    const id1 = userMap.get(emails[0])!;
    const id2 = userMap.get(emails[1])!;
    const [user1Id, user2Id] = [id1, id2].sort();

    const match = await prisma.match.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } },
    });

    if (match) {
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const senderId = userMap.get(msg.sender)!;
        await prisma.message.create({
          data: {
            content: msg.content,
            senderId,
            matchId: match.id,
            createdAt: new Date(Date.now() - (messages.length - i) * 60000 * 30), // spaced 30min apart
          },
        });
      }
      // Update lastMessageAt
      await prisma.match.update({
        where: { id: match.id },
        data: { lastMessageAt: new Date() },
      });
    }
  }
  console.log(`  ✅ Created sample messages\n`);

  // ===== 添加一些照片（使用占位 URL） =====
  console.log('🖼️  Adding placeholder photos...');

  const photoAssignment: Array<{ email: string; photos: string[] }> = [
    {
      email: 'alice@test.com',
      photos: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      ],
    },
    {
      email: 'bob@test.com',
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      ],
    },
    {
      email: 'luna@test.com',
      photos: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
      ],
    },
    {
      email: 'ryan@test.com',
      photos: [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      ],
    },
    {
      email: 'emma@test.com',
      photos: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      ],
    },
    {
      email: 'sophie@test.com',
      photos: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
        'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400',
      ],
    },
  ];

  let photoCount = 0;
  for (const { email, photos } of photoAssignment) {
    const userId = userMap.get(email)!;
    for (let i = 0; i < photos.length; i++) {
      await prisma.photo.create({
        data: {
          url: photos[i],
          order: i,
          userId,
        },
      });
      photoCount++;
    }
  }
  console.log(`  ✅ Added ${photoCount} photos for ${photoAssignment.length} users\n`);

  // ===== 最终统计 =====
  console.log('═══════════════════════════════════');
  console.log('✅ Seed complete!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   ${createdUsers.length} users`);
  console.log(`   ${likes.length} likes`);
  console.log(`   ${mutualPairs.length} matches`);
  console.log(`   ${photoCount} photos`);
  console.log('');
  console.log('📧 Test accounts (password: 123456):');
  console.log('   北京 (12 users): alice@test.com ~ peter@test.com');
  console.log('   上海:  lucas@test.com, ivy@test.com, tom@test.com');
  console.log('   深圳:  ava@test.com, derek@test.com');
  console.log('   杭州:  chloe@test.com, eric@test.com');
  console.log('   成都:  fiona@test.com, hank@test.com');
  console.log('   广州:  iris@test.com, nick@test.com');
  console.log('');
  console.log('💡 Try: Alice ←mutual→ Bob (discover for Bob, like back for match)');
  console.log('═══════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
