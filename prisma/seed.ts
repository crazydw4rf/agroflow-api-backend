import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function biji() {
  await prisma.$connect();

  const user_ucup = await prisma.user.upsert({
    where: { email: "ucupucup01@xyz.com" },
    update: {},
    create: {
      first_name: "Ucup",
      last_name: "Santoso",
      email: "ucupucup01@xyz.com",
      password_hash: await Bun.password.hash("ucup123456"),
    },
  });

  const project_x = await prisma.project.create({
    data: {
      project_name: "Project X",
      budget: 100_000_000,
      start_date: new Date(),
      target_date: new Date(Date.now() + 60 * 60 * 1000 * 24 * 120), // 120 hari ke depan
      description: "foo bar",
      user_id: user_ucup.id,
    },
  });

  console.log({  user_ucup, project_x });
}

try {
  await biji();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
