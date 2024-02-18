import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely'
import Pool from 'pg-pool'

import { Tables } from './db.types'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

export const db = new Kysely<Tables>({
  dialect: new PostgresDialect({
    pool: new Pool({
      max: 10,
      connectionString: process.env.DATABASE_URL,
    }),
  }),
  plugins: [new CamelCasePlugin()],
})
