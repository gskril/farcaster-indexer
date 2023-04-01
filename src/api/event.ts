import supabase from '../supabase.js'

/**
 * Insert an event ID in the database
 * @param eventId Hub event ID
 */
export async function insertEvent(eventId: number) {
  const { error } = await supabase.from('event').insert({ id: eventId })

  if (error) {
    console.error('ERROR INSERTING EVENT', error)
  } else {
    console.log(`EVENT INSERTED -- ${eventId}`)
  }
}

/**
 * Get the latest event ID from the database
 * @returns Latest event ID
 */
export async function getLatestEvent(): Promise<number | undefined> {
  const { data, error } = await supabase
    .from('event')
    .select('id')
    .limit(1)
    .order('id', { ascending: false })

  if (error) {
    console.error('ERROR GETTING LATEST EVENT', error)
  }

  return data?.[0]?.id
}
