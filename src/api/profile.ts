import * as protobufs from '@farcaster/protobufs'
import { fromFarcasterTime } from '@farcaster/utils'

import { formatHash } from '../lib.js'
import supabase from '../supabase.js'
import { MergeMessageHubEvent } from '../types'
import { Profile } from '../types/db'

/**
 * Insert a new profile in the database
 * @param msg ID Registry `Register` contract event
 */
export async function insertProfile(msg: protobufs.IdRegistryEvent) {
  const profile: Profile = {
    id: msg.fid,
    owner: formatHash(msg.to),
    registered_at: new Date(),
    updated_at: new Date(),
  }

  const insert = await supabase.from('profile').insert(profile)

  if (insert.error) {
    console.error('ERROR INSERTING PROFILE', insert.error)
  } else {
    console.log('PROFILE INSERTED', msg.fid)
  }
}

/**
 * Update a profile owner in the database
 * @param msg ID Registry `Transfer` contract event
 */
export async function updateProfileOwner(msg: protobufs.IdRegistryEvent) {
  const profile: Profile = {
    id: msg.fid,
    owner: formatHash(msg.to),
    updated_at: new Date(),
  }

  const update = await supabase
    .from('profile')
    .update(profile)
    .eq('id', msg.fid)

  if (update.error) {
    console.error('ERROR UPDATING FID OWNER', update.error)
  } else {
    console.log('FID OWNER UPDATED', msg.fid)
  }
}

/**
 * Update a profile in the database
 * @param msg Hub event in JSON format
 */
export async function updateProfile(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid
  const type = msg.data.userDataBody!.type

  // Handle all types: PFP (1), DISPLAY (2), BIO (3), URL (4), FNAME (5)
  const map = new Map([
    [1, 'avatar_url'],
    [2, 'display_name'],
    [3, 'bio'],
    [4, 'url'],
    [5, 'username'],
  ])

  const key = map.get(type)

  if (!key) return

  const profile: Profile = {
    id: fid,
    [key]: msg.data.userDataBody!.value,
    updated_at: new Date(),
  }

  const update = await supabase.from('profile').update(profile).eq('id', fid)

  if (update.error) {
    console.error('ERROR UPDATING PROFILE', update.error)
  } else {
    console.log('PROFILE UPDATED', fid)
  }
}
