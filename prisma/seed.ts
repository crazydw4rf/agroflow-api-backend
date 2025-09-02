import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function biji() {
  const ucup = await prisma.user.upsert({
    where: { email: "ucupucup01@xyz.com" },
    update: {},
    create: {
      first_name: "Ucup",
      last_name: "Santoso",
      email: "ucupucup01@xyz.com",
      password_hash: await Bun.password.hash("ucup123456"),
    },
  });

  console.log({ ucup });
}

try {
  await biji();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
