import { castsTable } from '../index.js'
import supabase from '../supabase.js'

/**
 * Mark casts as deleted if there's a matching delete:farcaster:// message.
 * Only checks the 100 most recent delete messages (Supabase limit for 1 call).
 */
export async function deleteCasts() {
  const deleteSyntax = 'delete:farcaster://casts/'
  const { data: deleteMessages, error: deletedMessagesErr } = await supabase
    .from(castsTable)
    .select('text')
    .like('text', `${deleteSyntax}%`)
    .order('published_at', { ascending: false })
    .limit(100)

  if (!deleteMessages || deleteMessages.length === 0 || deletedMessagesErr) {
    throw new Error('No casts found.')
  }

  const merkleRootsOfDeletedCasts: string[] = deleteMessages.map(
    (cast) => cast.text.split(deleteSyntax)[1]
  )

  const { error: deleteErr } = await supabase
    .from(castsTable)
    .update({ deleted: true })
    .in(
      'merkle_root',
      merkleRootsOfDeletedCasts.map((castMerkleRoot) => castMerkleRoot)
    )

  if (deleteErr) {
    console.error(deleteErr)
    throw new Error('Failed to mark casts as deleted.')
  }
}
