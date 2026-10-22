import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('Admin1234*', 10);
  const userPassword = await bcrypt.hash('Runner1234*', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wspeedrun.dev' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@wspeedrun.dev',
      password: adminPassword,
      country: 'Indonesia',
      role: 'ADMIN',
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@wspeedrun.dev' },
    update: {},
    create: {
      username: 'alice',
      email: 'alice@wspeedrun.dev',
      password: userPassword,
      country: 'Canada',
      role: 'USER',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@wspeedrun.dev' },
    update: {},
    create: {
      username: 'bob',
      email: 'bob@wspeedrun.dev',
      password: userPassword,
      country: 'Brazil',
      role: 'USER',
    },
  });

  const hollowKnight = await prisma.game.upsert({
    where: { gameId: 'seed-game-hollow-knight' },
    update: {},
    create: {
      gameId: 'seed-game-hollow-knight',
      gameName: 'Hollow Knight',
      gameDescription:
        'Explore the vast kingdom of Hallownest and unlock new powerful abilities.',
    },
  });

  const celeste = await prisma.game.upsert({
    where: { gameId: 'seed-game-celeste' },
    update: {},
    create: {
      gameId: 'seed-game-celeste',
      gameName: 'Celeste',
      gameDescription:
        'Help Madeline survive her inner demons on her journey to the top of Celeste Mountain.',
    },
  });

  const hades = await prisma.game.upsert({
    where: { gameId: 'seed-game-hades' },
    update: {},
    create: {
      gameId: 'seed-game-hades',
      gameName: 'Hades',
      gameDescription:
        'Defy the god of the dead as you hack and slash out of the Underworld.',
    },
  });

  const runOne = await prisma.run.upsert({
    where: { runId: 'seed-run-alice-hollow-knight' },
    update: {},
    create: {
      runId: 'seed-run-alice-hollow-knight',
      gameId: hollowKnight.gameId,
      userId: alice.userId,
      vodUrl: 'https://www.youtube.com/watch?v=seed-alice-hk',
      runDuration: 5124,
    },
  });

  const runTwo = await prisma.run.upsert({
    where: { runId: 'seed-run-bob-hollow-knight' },
    update: {},
    create: {
      runId: 'seed-run-bob-hollow-knight',
      gameId: hollowKnight.gameId,
      userId: bob.userId,
      vodUrl: 'https://www.youtube.com/watch?v=seed-bob-hk',
      runDuration: 5890,
    },
  });

  await prisma.run.upsert({
    where: { runId: 'seed-run-alice-celeste' },
    update: {},
    create: {
      runId: 'seed-run-alice-celeste',
      gameId: celeste.gameId,
      userId: alice.userId,
      vodUrl: 'https://www.youtube.com/watch?v=seed-alice-celeste',
      runDuration: 3210,
    },
  });

  await prisma.run.upsert({
    where: { runId: 'seed-run-bob-hades' },
    update: {},
    create: {
      runId: 'seed-run-bob-hades',
      gameId: hades.gameId,
      userId: bob.userId,
      vodUrl: 'https://www.youtube.com/watch?v=seed-bob-hades',
      runDuration: 4460,
    },
  });

  await prisma.runComment.upsert({
    where: { commentId: 'seed-comment-1' },
    update: {},
    create: {
      commentId: 'seed-comment-1',
      runId: runOne.runId,
      userId: bob.userId,
      comment: 'Great route through Deepnest!',
    },
  });

  await prisma.runComment.upsert({
    where: { commentId: 'seed-comment-2' },
    update: {},
    create: {
      commentId: 'seed-comment-2',
      runId: runTwo.runId,
      userId: alice.userId,
      comment: 'Solid split on the final boss.',
    },
  });

  console.log('Seed complete');
  console.log(`Admin: admin@wspeedrun.dev / Admin1234*`);
  console.log(`Users: alice@wspeedrun.dev, bob@wspeedrun.dev / Runner1234*`);
  console.log(`Admin ID: ${admin.userId}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
