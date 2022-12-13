import 'dotenv/config'

import supabase from '../supabase.js'

/**
 * If you were running the previous version of the indexer and have a 'profiles' table, you can
 * run this function to migrate all profiles' registartion dates into the new 'profile' table.
 * That's the only data that isn't derived from Merkle API data.
 */
async function migrateProfiles() {
  const { data: oldProfiles } = await supabase
    .from('profiles')
    .select('id, registered_at')

  if (!oldProfiles) {
    console.log('Old profiles table does not exist, nothing to migrate')
    return
  }

  // Upsert all old profiles into the new table
  const { error: upsertError } = await supabase
    .from('profile')
    .upsert(oldProfiles)

  if (upsertError) {
    console.error('Error upserting old profiles', upsertError)
    return
  } else {
    console.log('Profile registration dates migrated to new table')
  }
}

migrateProfiles()
