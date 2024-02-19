import { Message } from '@farcaster/hub-nodejs'
import Bottleneck from 'bottleneck'

export function createBatcher(
  callback: (msgs: Message[]) => Promise<void>,
  options?: Bottleneck.BatcherOptions
) {
  const batcher = new Bottleneck.Batcher(
    options || {
      maxTime: 10_000,
      maxSize: 100,
    }
  )

  batcher.on('batch', async (msgs) => await callback(msgs))

  return batcher
}
