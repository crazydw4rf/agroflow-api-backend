import { PrismaClient } from "@/generated/prisma";

export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }
}

export default PrismaService;
