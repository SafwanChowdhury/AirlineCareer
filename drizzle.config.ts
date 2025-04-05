import type { Config } from 'drizzle-kit';

// Configuration for career database (primary)
export default {
  schema: './src/lib/career-schema.ts',
  out: './src/lib/migrations/career',
  dialect: 'sqlite',
  dbCredentials: {
    url: './career.db'
  }
} satisfies Config; 