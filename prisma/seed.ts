import { password as argon2 } from "bun";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ucup = await prisma.user.upsert({
    where: { email: "ucupucup01@xyz.com" },
    update: {},
    create: {
      name: "Ucup",
      email: "ucupucup01@xyz.com",
      password: await argon2.hash("ucup123456"),
    },
  });

  console.log({ ucup });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
