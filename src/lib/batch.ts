import { Message } from '@farcaster/hub-nodejs'
import Bottleneck from 'bottleneck'

import { deleteCasts, insertCasts } from '../api/cast.js'
import { insertFid } from '../api/fid.js'
import { deleteLinks, insertLinks } from '../api/link.js'
import { deleteReactions, insertReactions } from '../api/reaction.js'
import { insertUserDatas } from '../api/user-data.js'
import {
  deleteVerifications,
  insertVerifications,
} from '../api/verification.js'

export function createBatcher(
  callback: (msgs: Message[]) => Promise<void>,
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

export const castAddBatcher = createBatcher(insertCasts)
export const castRemoveBatcher = createBatcher(deleteCasts)
export const verificationAddBatcher = createBatcher(insertVerifications)
export const verificationRemoveBatcher = createBatcher(deleteVerifications)
export const userDataAddBatcher = createBatcher(insertUserDatas)
export const reactionAddBatcher = createBatcher(insertReactions)
export const reactionRemoveBatcher = createBatcher(deleteReactions)
export const linkAddBatcher = createBatcher(insertLinks)
export const linkRemoveBatcher = createBatcher(deleteLinks)
export const fidAddBatcher = createBatcher(insertFid)
