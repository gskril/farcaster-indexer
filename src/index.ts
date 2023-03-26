import 'dotenv/config'

import { sendTestMessages } from './helpers/dummy.js'
import { watch } from './lib.js'

await watch()
await sendTestMessages()
