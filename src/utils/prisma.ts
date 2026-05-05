import '../configuration/dns';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  pool: Pool;
};

const getPrismaDatasourceUrl = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(databaseUrl);
    const hasPoolerHints =
      parsedUrl.searchParams.get('pgbouncer') === 'true' ||
      parsedUrl.hostname.includes('pooler') ||
      parsedUrl.port === '6543';

    if (process.env.NODE_ENV === 'production' || hasPoolerHints) {
      // Avoid prepared statement issues when using pooled Postgres connections.
      if (!parsedUrl.searchParams.has('pgbouncer')) {
        parsedUrl.searchParams.set('pgbouncer', 'true');
      }

      if (!parsedUrl.searchParams.has('connection_limit')) {
        parsedUrl.searchParams.set('connection_limit', '1');
      }

      return parsedUrl.toString();
    }

    return databaseUrl;
  } catch {
    return databaseUrl;
  }
};

const prismaDatasourceUrl = getPrismaDatasourceUrl();

// Create PostgreSQL connection pool with IPv4 DNS resolution
export const pool = globalForPrisma.pool || new Pool({
  connectionString: process.env.DATABASE_URL,
  // Production-ready pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Force IPv4 resolution via Node.js connection options
  options: '-c search_path=public',
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool;

// Create Prisma Client without adapter for now (to fix compatibility issues)
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: prismaDatasourceUrl
      ? {
          db: {
            url: prismaDatasourceUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
