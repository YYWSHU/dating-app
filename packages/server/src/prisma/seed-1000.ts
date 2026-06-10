import { PrismaClient, Gender, InterestedIn, LikeType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ===== 数据池 =====
const FIRST_NAMES = {
  female: ['梦瑶','诗涵','雨桐','梓萱','思雨','若曦','晓月','清欢','念安','知夏','浅溪','初然','洛灵','苏瑾','南絮','未央','星野','云裳','抚琴','听雪','画扇','揽月','折柳','采薇','沐晴','凝香','映荷','凌波','如烟','若水','婉清','语嫣','芷若','念慈','青桐','碧瑶','雪见','龙葵','紫萱','花楹'],
  male: ['宇轩','子涵','浩然','子墨','博文','天佑','俊杰','明哲','烨磊','致远','逸飞','青云','正豪','志远','文博','弘毅','鹏程','翰林','鸿飞','承志','修远','子昂','煜城','铭泽','瑞霖','少卿','伯符','云长','奉先','公瑾','孔明','子龙','鹏举','廷议','继业','去病','弃疾','守仁','居正','光启'],
  other: ['子安','晓晨','笔墨','流光','盛夏','晚风','深海','星河','长歌','拾光','南风','北冥','无羡','忘机','行云','落尘'],
};

const SURNAMES = ['王','李','张','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗','梁','宋','郑','谢','韩','唐','冯','于','董','萧','程','曹','袁','邓','许','傅','沈','曾','彭','吕','苏','卢','蒋','蔡','贾','丁','魏','薛','叶','阎'];

const BIOS_FEMALE = [
  '热爱生活，喜欢旅行和美食 🌸', '咖啡重度患者，周末爱探店 ☕', '瑜伽爱好者，寻找灵魂伴侣 🧘', '互联网打工人，日常搬砖偶尔精致 💻', '喜欢小动物，家里有两只猫 🐱', '文艺女青年，爱看书爱画画 📚', '健身房常客，一起流汗呀 💪', '烘焙新手，想做蛋糕给你吃 🎂', '摄影师，记录生活每一个瞬间 📷', '超爱音乐，弹得一手好吉他 🎸', '独立自信，期待遇见有趣的你 ✨', '慢热但长情，希望慢慢了解 🌿', '喜欢户外，周末经常爬山露营 ⛰️', '自由职业，喜欢这种掌控感 🎨', '吃货一枚，川菜火锅是心头好 🍲',
];
const BIOS_MALE = [
  '程序员，理性与感性并存 💻', '喜欢运动，周末经常打球健身 🏀', '创业中，心中有火眼里有光 🔥', '喜欢音乐和旅行，期待和你一起 🎵', '金融男，但生活不只有K线 📈', '工程师，动手能力强，会修各种东西 🔧', '安静内敛，熟了之后其实很逗 😄', '热爱烹饪，拿手菜是红烧排骨 🍳', '有自己的小事业，生活充实而稳定 🏠', '喜欢户外和摄影，走过20+个国家 📸', '医生一枚，不太会撩但很真诚 🩺', '教书育人，喜欢简单的快乐 📖', '热爱健身和跑步，自律给我自由 🏃', '设计师，对美有自己的理解 🎨', '每天两点一线，想找个一起吃饭的人 🍜',
];
const BIOS_OTHER = [
  '不定义自己，只做真实的自己 🌈', '来这寻找真心的连接 💫', '对性别标签无感，重要的是灵魂', '开放包容，期待遇见同样自由的灵魂',
];

const TAGS_POOL = ['旅行','美食','摄影','瑜伽','健身','音乐','咖啡','读书','画画','编程','户外','电影','游戏','烹饪','登山','滑雪','潜水','骑行','跑步','篮球','足球','网球','游泳','舞蹈','设计','创业','AI','投资','哲学','心理学','历史','天文','植物','宠物','猫','狗','烘焙','茶道','红酒','精酿','民谣','摇滚','爵士','电子','动漫','手办','剧本杀','桌游','露营','自驾','冲浪','滑板','攀岩','冥想','素食','二手','极简','古着','纹身','脱口秀','话剧','看展','逛博物馆'];

const MBTI_TYPES = ['INTJ','INTP','INFJ','INFP','ENTJ','ENTP','ENFJ','ENFP','ISTJ','ISFJ','ISTP','ISFP','ESTJ','ESFJ','ESTP','ESFP'];

const CITIES: Array<{ name: string; lat: number; lng: number; weight: number }> = [
  { name:'北京', lat:39.91, lng:116.40, weight:18 },
  { name:'上海', lat:31.23, lng:121.47, weight:14 },
  { name:'广州', lat:23.13, lng:113.26, weight:10 },
  { name:'深圳', lat:22.54, lng:114.06, weight:10 },
  { name:'杭州', lat:30.27, lng:120.15, weight:8 },
  { name:'成都', lat:30.57, lng:104.07, weight:8 },
  { name:'南京', lat:32.06, lng:118.80, weight:6 },
  { name:'武汉', lat:30.59, lng:114.31, weight:6 },
  { name:'重庆', lat:29.53, lng:106.55, weight:5 },
  { name:'西安', lat:34.26, lng:108.94, weight:5 },
  { name:'长沙', lat:28.23, lng:112.94, weight:3 },
  { name:'苏州', lat:31.30, lng:120.62, weight:3 },
  { name:'天津', lat:39.13, lng:117.18, weight:2 },
  { name:'厦门', lat:24.48, lng:118.09, weight:2 },
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] { const s = [...arr]; for (let i=s.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[s[i],s[j]]=[s[j],s[i]];} return s.slice(0,n); }
function rand(min:number,max:number):number { return Math.floor(Math.random()*(max-min+1))+min; }
function randFloat(min:number,max:number):number { return Math.round((Math.random()*(max-min)+min)*100000)/100000; }
function randDate(after: Date, before: Date) { return new Date(after.getTime()+Math.random()*(before.getTime()-after.getTime())); }

function weightedPick(cities: typeof CITIES) {
  const total = cities.reduce((s,c)=>s+c.weight,0);
  let r = Math.random()*total;
  for (const c of cities) { r-=c.weight; if (r<=0) return c; }
  return cities[0];
}

async function main() {
  console.log('🌱 生成 1000 用户测试数据...\n');

  // Clean
  console.log('🧹 清理旧数据...');
  await prisma.message.deleteMany();
  await prisma.userRating.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.match.deleteMany();
  await prisma.like.deleteMany();
  await prisma.passRecord.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.conversationStarter.deleteMany();
  await prisma.user.deleteMany();
  console.log('   ✅ 已清理\n');

  const password = await bcrypt.hash('123456', 12);
  const users: Array<{ id: string; email: string; nickname: string; gender: Gender; mbti: string | null; tags: string[]; city: string }> = [];

  // ===== 1. 生成 1000 用户 =====
  console.log('👤 生成 1000 用户...');
  const genderPool: Gender[] = [];
  for (let i=0;i<500;i++) genderPool.push(Gender.male);
  for (let i=0;i<480;i++) genderPool.push(Gender.female);
  for (let i=0;i<20;i++) genderPool.push(Gender.other);
  // shuffle
  for (let i=genderPool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[genderPool[i],genderPool[j]]=[genderPool[j],genderPool[i]];}

  const now = new Date();
  for (let i = 0; i < 1000; i++) {
    const gender = genderPool[i];
    const firstName = pick(FIRST_NAMES[gender]);
    const surname = pick(SURNAMES);
    const nickname = i < 10 ? firstName : surname + firstName;
    const email = `u${i + 1000}@test.com`;
    const city = weightedPick(CITIES);
    const gpsJitter = 0.02;

    const interestedInChoices: Record<string, InterestedIn[]> = {
      male: [InterestedIn.female, InterestedIn.male, InterestedIn.both],
      female: [InterestedIn.male, InterestedIn.female, InterestedIn.both],
      other: [InterestedIn.both, InterestedIn.both, InterestedIn.male, InterestedIn.female],
    };
    const interestedIn = pick(interestedInChoices[gender]);

    let bio: string;
    if (gender === Gender.female) bio = pick(BIOS_FEMALE);
    else if (gender === Gender.male) bio = pick(BIOS_MALE);
    else bio = pick(BIOS_OTHER);

    const age = rand(20, 40);
    const tagCount = rand(3, 8);
    const tags = pickN(TAGS_POOL, tagCount);
    const hasMbti = Math.random() < 0.6;
    const mbti = hasMbti ? pick(MBTI_TYPES) : null;

    let bigFive: any = undefined;
    if (hasMbti && Math.random() < 0.8) {
      bigFive = {
        openness: randFloat(0.2, 0.9),
        conscientiousness: randFloat(0.2, 0.9),
        extraversion: randFloat(0.2, 0.9),
        agreeableness: randFloat(0.2, 0.9),
        neuroticism: randFloat(0.2, 0.9),
      };
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        nickname,
        gender,
        interestedIn,
        birthDate: new Date(now.getFullYear() - age, rand(0, 11), rand(1, 28)),
        bio: bio + (Math.random() < 0.3 ? '' : ''),
        tags,
        mbti,
        bigFive: bigFive || undefined,
        latitude: randFloat(city.lat - gpsJitter, city.lat + gpsJitter),
        longitude: randFloat(city.lng - gpsJitter, city.lng + gpsJitter),
        maxDistance: pick([10, 20, 30, 50, 100, 200]),
        minAge: pick([18, 20, 22, 25]),
        maxAge: pick([30, 35, 40, 45, 50, 60]),
        emailVerified: Math.random() < 0.7,
        campusEmail: Math.random() < 0.05,
        admin: i === 0,
        isVip: Math.random() < 0.08,
        vipExpiresAt: Math.random() < 0.08 ? new Date(Date.now() + rand(1, 365) * 86400000) : null,
      },
    });
    users.push({ id: user.id, email, nickname, gender, mbti, tags, city: city.name });

    if (i % 100 === 0) console.log(`   ${i}/1000`);
  }
  console.log('   ✅ 1000 用户已生成\n');

  const userMap = new Map(users.map((u) => [u.email, u.id]));

  // ===== 2. 生成 Likes + Matches =====
  console.log('💕 生成 Like 关系和匹配...');
  let likeCount = 0;
  let matchCount = 0;

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    // 每人随机 like 3-25 个人
    const likeN = rand(3, 25);
    const candidates = users.filter((t) => t.id !== u.id && t.gender !== u.gender);
    const targets = pickN(candidates, Math.min(likeN, candidates.length));

    for (const t of targets) {
      const type: LikeType = Math.random() < 0.1 ? 'superlike' : 'like';
      try {
        await prisma.like.create({ data: { likerId: u.id, likedId: t.id, type } });
        likeCount++;

        // Check mutual
        const reciprocal = await prisma.like.findUnique({
          where: { likerId_likedId: { likerId: t.id, likedId: u.id } },
        });
        if (reciprocal) {
          const [uid1, uid2] = [u.id, t.id].sort();
          try {
            const matchDate = randDate(new Date(Date.now() - 30 * 86400000), now);
            await prisma.match.create({
              data: { user1Id: uid1, user2Id: uid2, matchDate, lastMessageAt: null },
            });
            matchCount++;
          } catch { /* already exists */ }
        }
      } catch { /* duplicate */ }
    }

    if (i % 100 === 0) console.log(`   likes: ${i}/1000, matches so far: ${matchCount}`);
  }
  console.log(`   ✅ ${likeCount} likes, ${matchCount} matches\n`);

  // ===== 3. 生成消息 =====
  console.log('💬 生成聊天消息...');
  let msgCount = 0;
  const allMatches = await prisma.match.findMany({ select: { id: true, user1Id: true, user2Id: true } });

  const MESSAGE_TEMPLATES = [
    '你好呀！👋', 'Hi！很高兴认识你', '看了你的资料，觉得你很有意思', '你的标签里也有旅行！你去过哪里？',
    '哈哈，我也喜欢这个！', '周末打算做什么？', '最近在看什么剧吗？', '推荐一家超好吃的餐厅给你',
    '今天天气不错，出去走走了吗', '你的照片拍得好好看', '你的MBTI是什么？我也是这个类型的',
    '好久没遇到这么聊得来的人了', '要不要周末一起喝杯咖啡？', '喜欢运动吗？一起打球呀',
    '刚看到一部超棒的电影，分享给你', '早呀，今天也要开心哦 ☀️', '晚安啦，明天聊 🌙',
    '你说的太对了！', '哈哈哈笑死我了 😂', '我也一直想去那里！',
    '你对这个话题怎么看？', '好喜欢你的生活方式', '我觉得我们挺投缘的',
    '你的工作听起来好有趣', '会做饭的男生加分！', '周末想约你出来见面，方便吗？',
    '今天加班好累啊 😭', '想你了 💕', '在干嘛呢？', '收到你的消息好开心',
  ];

  for (const match of allMatches) {
    // 60% of matches have conversations
    if (Math.random() < 0.4) continue;
    const msgN = rand(1, 20);
    const baseTime = randDate(new Date(Date.now() - 30 * 86400000), now);

    for (let j = 0; j < msgN; j++) {
      const senderId = j % 2 === 0 ? match.user1Id : match.user2Id;
      const content = pick(MESSAGE_TEMPLATES);
      const msgTime = new Date(baseTime.getTime() + j * rand(60000, 3600000));
      await prisma.message.create({
        data: { matchId: match.id, senderId, content, isRead: Math.random() < 0.8, createdAt: msgTime },
      });
      msgCount++;
    }

    // Update lastMessageAt
    await prisma.match.update({
      where: { id: match.id },
      data: { lastMessageAt: new Date() },
    });
  }
  console.log(`   ✅ ${msgCount} 条消息\n`);

  // ===== 4. 生成 PassRecord =====
  console.log('❌ 生成 Pass 记录...');
  let passCount = 0;
  for (let i = 0; i < 200; i++) {
    const a = pick(users); const b = pick(users);
    if (a.id === b.id) continue;
    try {
      await prisma.passRecord.create({ data: { passerId: a.id, passedId: b.id } });
      passCount++;
    } catch { /* dup */ }
  }
  console.log(`   ✅ ${passCount} pass 记录\n`);

  // ===== 5. 生成举报 =====
  console.log('🚨 生成举报...');
  const REPORT_REASONS = ['inappropriate', 'fake', 'spam', 'harassment', 'other'];
  let reportCount = 0;
  for (let i = 0; i < 15; i++) {
    const reporter = pick(users); const reported = pick(users);
    if (reporter.id === reported.id) continue;
    await prisma.report.create({
      data: {
        reporterId: reporter.id, reportedId: reported.id,
        reason: pick(REPORT_REASONS),
        detail: Math.random() < 0.5 ? pick(['这人的照片是假的','发垃圾广告','言语骚扰','感觉是机器人']) : null,
        status: pick(['pending', 'pending', 'pending', 'resolved', 'resolved', 'dismissed']),
      },
    });
    reportCount++;
  }
  console.log(`   ✅ ${reportCount} 举报\n`);

  // ===== 6. 生成屏蔽 =====
  console.log('🛡️ 生成屏蔽...');
  let blockCount = 0;
  for (let i = 0; i < 30; i++) {
    const blocker = pick(users); const blocked = pick(users);
    if (blocker.id === blocked.id) continue;
    try {
      await prisma.block.create({ data: { blockerId: blocker.id, blockedId: blocked.id } });
      blockCount++;
    } catch { /* dup */ }
  }
  console.log(`   ✅ ${blockCount} 屏蔽\n`);

  // ===== 7. 生成评分 =====
  console.log('⭐ 生成用户评分...');
  let ratingCount = 0;
  const allMatchesForRating = await prisma.match.findMany({ select: { user1Id: true, user2Id: true } });
  for (const m of allMatchesForRating) {
    if (Math.random() < 0.7) continue;
    const rater = Math.random() < 0.5 ? m.user1Id : m.user2Id;
    const rated = rater === m.user1Id ? m.user2Id : m.user1Id;
    try {
      await prisma.userRating.create({
        data: {
          raterId: rater, ratedUserId: rated,
          score: pick([3,4,4,5,5,5,5]),
          comment: Math.random() < 0.3 ? pick(['人很好','很聊得来','真人比照片好看','性格超棒']) : null,
        },
      });
      ratingCount++;
    } catch { /* dup */ }
  }
  console.log(`   ✅ ${ratingCount} 评分\n`);

  // ===== 8. 生成照片（用 Unsplash 占位） =====
  console.log('🖼️ 给部分用户添加照片...');
  const PHOTO_URLS = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
  ];
  let photoCount = 0;
  for (let i = 0; i < 300 && i < users.length; i++) {
    const u = users[i];
    const n = rand(1, 4);
    for (let j = 0; j < n; j++) {
      await prisma.photo.create({
        data: { userId: u.id, url: pick(PHOTO_URLS), order: j },
      });
      photoCount++;
    }
  }
  console.log(`   ✅ ${photoCount} 张照片\n`);

  // ===== 最终统计 =====
  const [totalUsers, totalMatches, totalMessages, totalLikes, totalReports, totalBlocks, totalRatings] = await Promise.all([
    prisma.user.count(), prisma.match.count(), prisma.message.count(), prisma.like.count(),
    prisma.report.count(), prisma.block.count(), prisma.userRating.count(),
  ]);

  console.log('═══════════════════════════════════');
  console.log('✅ Seed 完成！');
  console.log('');
  console.log(`   👤 ${totalUsers} 用户`);
  console.log(`   💕 ${totalLikes} likes`);
  console.log(`   💘 ${totalMatches} matches`);
  console.log(`   💬 ${totalMessages} 条消息`);
  console.log(`   ❌ ${passCount} pass 记录`);
  console.log(`   🚨 ${totalReports} 举报`);
  console.log(`   🛡️ ${totalBlocks} 屏蔽`);
  console.log(`   ⭐ ${totalRatings} 评分`);
  console.log(`   🖼️ ${photoCount} 张照片`);
  console.log('');
  console.log('📧 账号: u1000@test.com ~ u1999@test.com (密码: 123456)');
  console.log('👑 管理员: u1000@test.com / 123456');
  console.log('═══════════════════════════════════');
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
