import { Cast, FlattenedCast } from '../types/index'

const flattenCast = (cast: Cast) => {
  const flattenedCast: FlattenedCast = {
    type: 'text-short',
    published_at: new Date(cast.body.publishedAt),
    sequence: cast.body.sequence,
    address: cast.body.address,
    username: cast.body.username,
    text: cast.body.data.text,
    reply_parent_merkle_root: cast.body.data.replyParentMerkleRoot || null,
    prev_merkle_root: cast.body.prevMerkleRoot || null,
    signature: cast.signature,
    merkle_root: cast.merkleRoot,
    thread_merkle_root: cast.threadMerkleRoot,
    display_name: cast.meta?.displayName || null,
    avatar_url: cast.meta?.avatar || null,
    avatar_verified: cast.meta?.isVerifiedAvatar || false,
    mentions: cast.meta?.mentions || [],
    num_reply_children: cast.meta?.numReplyChildren || null,
    reply_parent_username: cast.meta?.replyParentUsername?.username || null,
    reply_parent_address: cast.meta?.replyParentUsername?.address || null,
    reactions: cast.meta?.reactions?.count || null,
    recasts: cast.meta?.recasts?.count || null,
    watches: cast.meta?.watches?.count || null,
    recasters: cast.meta?.recasters || [],
    deleted: cast.body.data.text.startsWith('delete:farcaster://') ? true : false,
    recast: cast.body.data.text.startsWith('recast:') ? true : false,
  }

  return flattenedCast
}

export default flattenCast
