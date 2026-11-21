import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function initDatabasePragmas(): Promise<void> {
  await prisma.$executeRawUnsafe("PRAGMA journal_mode = WAL;");
  await prisma.$executeRawUnsafe("PRAGMA synchronous = NORMAL;");
  await prisma.$executeRawUnsafe("PRAGMA cache_size = -64000;");
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
}
