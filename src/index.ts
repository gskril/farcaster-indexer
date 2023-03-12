import 'dotenv/config'

import {
  deleteCast,
  likeCast,
  publishCast,
  sleep,
  unlikeCast,
  updatePfp,
} from './helpers/dummy.js'
import { watch } from './lib.js'

async function sendTestMessages() {
  await sleep()
  const cast = await publishCast()
  if (!cast) return

  await sleep()
  await likeCast(cast)

  await sleep()
  await unlikeCast(cast)

  await sleep()
  await updatePfp()

  await sleep()
  await deleteCast(cast)
}

await watch()
await sendTestMessages()
