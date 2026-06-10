import { PrismaClient, Gender, InterestedIn } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('123456', 12);

  const users = [
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
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`  ✅ Created user: ${user.nickname} (${user.email})`);
  }

  console.log('✅ Seed complete!');
  console.log('📧 Test accounts (password: 123456):');
  users.forEach((u) => console.log(`   ${u.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
