import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial core projects...");

  const projects = [
    {
      name: "كاش إكس",
      code: "CASHX",
      color: "#3B82F6",
      icon: "wallet",
      description: "نظام إدارة الكاش والمبيعات والمدفوعات الإلكترونية"
    },
    {
      name: "سجدة لنقاط البيع",
      code: "SAJDA",
      color: "#10B981",
      icon: "cash-register",
      description: "نظام الكاشير وإدارة المخزون ونقاط البيع السحابية"
    },
    {
      name: "قاعات الأفراح",
      code: "WEDDING",
      color: "#8B5CF6",
      icon: "crown",
      description: "منظومة إدارة حجوزات ومواعيد قاعات الأفراح والمناسبات"
    }
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        color: p.color,
        icon: p.icon,
        description: p.description
      },
      create: p
    });
  }

  console.log("Projects seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
