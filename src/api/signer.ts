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

  const signer: Signer = {
    fid,
    signer: formatHash(msg.data.signerAddBody!.signer),
    name: msg.data.signerAddBody!.name,
  }

  const insert = await supabase.from('signer').insert(signer)

  if (insert.error) {
    console.log('ERROR INSERTING SIGNER', insert.error)
  } else {
    console.log('SIGNER INSERTED', fid)
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
    console.log('ERROR DELETING SIGNER', drop.error)
  } else {
    console.log('SIGNER DELETED', fid)
  }
}
