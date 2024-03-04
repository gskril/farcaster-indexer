import { Message } from '@farcaster/hub-nodejs'
import Bottleneck from 'bottleneck'

import { deleteCasts, insertCasts } from '../api/cast.js'
import { deleteLinks, insertLinks } from '../api/link.js'
import { deleteReactions, insertReactions } from '../api/reaction.js'
import { insertUserDatas } from '../api/user-data.js'
import {
  deleteVerifications,
  insertVerifications,
} from '../api/verification.js'

export function createBatcher<T>(
  callback: (msgs: T[]) => Promise<void>,
  options?: Bottleneck.BatcherOptions
) {
  const batcher = new Bottleneck.Batcher(
    options || {
      maxTime: 10_000,
      maxSize: 1_000,
    }
  )

  batcher.on('batch', async (msgs) => await callback(msgs))

  return batcher
}

export const castAddBatcher = createBatcher<Message>(insertCasts)
export const castRemoveBatcher = createBatcher<Message>(deleteCasts)
// prettier-ignore
export const verificationAddBatcher = createBatcher<Message>(insertVerifications)
// prettier-ignore
export const verificationRemoveBatcher = createBatcher<Message>(deleteVerifications)
export const userDataAddBatcher = createBatcher<Message>(insertUserDatas)
export const reactionAddBatcher = createBatcher<Message>(insertReactions)
export const reactionRemoveBatcher = createBatcher<Message>(deleteReactions)
export const linkAddBatcher = createBatcher<Message>(insertLinks)
export const linkRemoveBatcher = createBatcher<Message>(deleteLinks)
