import { fromFarcasterTime } from '@farcaster/utils'

import { formatHash } from '../lib.js'
import supabase from '../supabase.js'
import { MergeMessageHubEvent } from '../types'
import { Verification } from '../types/db'

/**
 * Insert a new verification in the database
 * @param msg Hub event in JSON format
 */
export async function insertVerification(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid
  const address = formatHash(msg.data.verificationAddEthAddressBody!.address)
  const timestamp = fromFarcasterTime(msg.data.timestamp)._unsafeUnwrap()
  const signature = formatHash(
    msg.data.verificationAddEthAddressBody!.ethSignature
  )

  const verification: Verification = {
    fid,
    address,
    signature,
    created_at: new Date(timestamp),
  }

  const { error } = await supabase.from('verification').insert(verification)

  if (error) {
    console.log('ERROR INSERTING VERIFICATION', error)
  } else {
    console.log('VERIFICATION INSERTED', fid, address)
  }
}

/**
 * Delete a verification from the database
 * @param msg Hub event in JSON format
 */
export async function deleteVerification(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid
  const address = formatHash(msg.data.verificationRemoveBody!.address)

  const drop = await supabase
    .from('verification')
    .delete()
    .eq('fid', fid)
    .eq('address', address)

  if (drop.error) {
    console.log('ERROR DELETING VERIFICATION', drop.error)
  } else {
    console.log('VERIFICATION DELETED', fid, address)
  }
}
