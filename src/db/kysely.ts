import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely'
import { NeonDialect } from 'kysely-neon'
import Pool from 'pg-pool'
import ws from 'ws'

import { Tables } from './db.types'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const basicPostgresDialect = new PostgresDialect({
  pool: new Pool({
    connectionString: DATABASE_URL,
  }),
})

const neonDialect = new NeonDialect({
  connectionString: DATABASE_URL,
  webSocketConstructor: ws,
})

export const db = new Kysely<Tables>({
  dialect: DATABASE_URL.includes('neon.tech')
    ? neonDialect
    : basicPostgresDialect,
  plugins: [new CamelCasePlugin()],
})
