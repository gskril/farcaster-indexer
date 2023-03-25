import 'dotenv/config'

import { sendTestMessages } from './helpers/dummy.js'
import { seed } from './helpers/seed.js'
import { watch } from './lib.js'

await watch()
await seed()
// await sendTestMessages()
