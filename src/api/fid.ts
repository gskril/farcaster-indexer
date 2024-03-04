import { OnChainEvent } from '@farcaster/hub-nodejs'

import { db } from '../db/kysely.js'
import { log } from '../lib/logger.js'
import { formatFids } from '../lib/utils.js'

export async function insertFid(events: OnChainEvent[]) {
  const fids = formatFids(events)

  try {
    await db
      .insertInto('fids')
      .values(fids)
      .onConflict((oc) =>
        oc.column('fid').doUpdateSet((eb) => ({
          registeredAt: eb.ref('excluded.registeredAt'),
          custodyAddress: eb.ref('excluded.custodyAddress'),
          recoveryAddress: eb.ref('excluded.recoveryAddress'),
        }))
      )
      .execute()

    log.debug(`FID INSERTED`)
  } catch (error) {
    log.error(error, 'ERROR INSERTING FID')
  }
}
