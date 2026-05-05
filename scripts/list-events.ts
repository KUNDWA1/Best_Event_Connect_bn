import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const events = await p.event.findMany({
    select: { id: true, title: true, status: true, visibility: true, startDate: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(JSON.stringify(events, null, 2));
}
main().finally(() => p.$disconnect());
