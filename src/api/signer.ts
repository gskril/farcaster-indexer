import { formatHash } from '../lib.js'
import supabase from '../supabase.js'
import { MergeMessageHubEvent } from '../types'
import { Signer } from '../types/db'

/**
 * Insert a new signer in the database
 * @param msg Hub event in JSON format
 */
export async function insertSigner(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid
  const name = msg.data.signerAddBody!.name

  const signer: Signer = {
    fid,
    signer: formatHash(msg.data.signerAddBody!.signer),
    name,
  }

  const insert = await supabase.from('signer').insert(signer)

  if (insert.error) {
    console.error('ERROR INSERTING SIGNER', insert.error)
  } else {
    console.log(`SIGNER INSERTED -- "${name || 'untitled'}" by ${fid}`)
  }
}

/**
 * Upsert a list of signers in the database
 * @param signers List of signers
 */
export async function upsertSigners(signers: Signer[]) {
  if (signers.length === 0) return

  const { error } = await supabase.from('signer').upsert(signers, {
    onConflict: 'fid,signer',
    ignoreDuplicates: true,
  })

  if (error) {
    console.error('ERROR UPSERTING SIGNERS', error)
  } else {
    console.log('SIGNERS UPSERTED', signers.length)
  }
}

/**
 * Delete a signer from the database
 * @param msg Hub event in JSON format
 */
export async function deleteSigner(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid

  const drop = await supabase
    .from('signer')
    .delete()
    .eq('fid', fid)
    .eq('signer', formatHash(msg.data.signerRemoveBody!.signer))

  if (drop.error) {
    console.error('ERROR DELETING SIGNER', drop.error)
  } else {
    console.log(`SIGNER DELETED -- by ${fid}`)
  }
}

/**
 * Delete all messages from a signer from the database
 * @param signer Signer to delete messages from
 */
export async function deleteMessagesFromSigner(signer: string) {
  const dropCasts = await supabase
    .from('casts')
    .update({ deleted: true })
    .eq('signer', signer)

  if (dropCasts.error) {
    console.error('ERROR DELETING CASTS WITH REVOKED SIGNER', dropCasts.error)
  } else {
    console.log(`CASTS FROM REVOKED SIGNER DELETED -- ${signer}`)
  }

  const dropReactions = await supabase
    .from('reaction')
    .delete()
    .eq('signer', signer)

  if (dropReactions.error) {
    console.error(
      'ERROR DELETING REACTIONS WITH REVOKED SIGNER',
      dropReactions.error
    )
  } else {
    console.log(`REACTIONS FROM REVOKED SIGNER DELETED -- ${signer}`)
  }

  const dropVerifications = await supabase
    .from('verification')
    .delete()
    .eq('signer', signer)

  if (dropVerifications.error) {
    console.error(
      'ERROR DELETING VERIFICATIONS WITH REVOKED SIGNER',
      dropVerifications.error
    )
  } else {
    console.log(`VERIFICATIONS FROM REVOKED SIGNER DELETED -- ${signer}`)
  }
}

/**
 * Update a signer in the database
 * @param msg Hub event in JSON format
 * @param change Object with the fields to update
 */
export async function updateSigner(
  msg: MergeMessageHubEvent,
  change: { pruned: boolean }
) {
  const fid = msg.data.fid
  const signer = formatHash(msg.data.signerAddBody!.signer)

  const update = await supabase
    .from('signer')
    .update(change)
    .eq('fid', fid)
    .eq('signer', signer)

  if (update.error) {
    console.error('ERROR UPDATING SIGNER', update.error)
  } else {
    console.log(`SIGNER UPDATED -- $${signer} by ${fid}`)
  }
}
