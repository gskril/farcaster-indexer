import 'dotenv/config'
import { promises as fs } from 'fs'
import { FileMigrationProvider, Migrator } from 'kysely'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { log } from '../lib/logger.js'
import { db } from './kysely.js'

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        'migrations'
      ),
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      log.info(`Migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      log.error(`Failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    log.error(error, 'Failed to migrate')
    process.exit(1)
  }

  await db.destroy()
}

migrateToLatest()
