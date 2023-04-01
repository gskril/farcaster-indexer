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
