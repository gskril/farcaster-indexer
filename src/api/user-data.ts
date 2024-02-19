import { Message } from '@farcaster/hub-nodejs'

import { db } from '../db/kysely.js'
import { formatUserDatas } from '../lib/utils.js'

// TODO: Fix error 'Ensure that no rows proposed for insertion within the same command have duplicate constrained values.'
export async function insertUserDatas(msgs: Message[]) {
  const userDatas = formatUserDatas(msgs)

  try {
    await db
      .insertInto('userData')
      .values(userDatas)
      .onConflict((oc) =>
        oc.columns(['fid', 'type']).doUpdateSet((eb) => ({
          value: eb.ref('excluded.value'),
        }))
      )
      .execute()

    console.log(`USER DATA INSERTED`)
  } catch (error) {
    console.error('ERROR INSERTING USER DATA', error)
  }
}
