import 'dotenv/config'

import {
  createSigner,
  deleteCast,
  deleteSigner,
  likeCast,
  publishCast,
  sleep,
  unlikeCast,
  updatePfp,
} from './helpers/dummy.js'
import { watch } from './lib.js'

async function sendTestMessages() {
  await sleep()
  const signer = await createSigner()

  await sleep()
  const cast = await publishCast(signer)
  if (!cast) return

  await sleep()
  await likeCast(cast, signer)

  await sleep()
  await updatePfp(signer)

  await sleep()
  await unlikeCast(cast, signer)

  await sleep()
  await deleteCast(cast, signer)

  await sleep()
  await deleteSigner(signer)
}

await watch()
await sendTestMessages()
