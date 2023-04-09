import { db } from '../db.js'

/**
 * Insert an event ID in the database
 * @param eventId Hub event ID
 */
export async function insertEvent(eventId: number) {
  try {
    await db
      .insertInto('event')
      .values({ id: eventId })
      .onConflict((oc) => oc.column('id').doNothing())
      .executeTakeFirstOrThrow()
    console.log(`EVENT INSERTED -- ${eventId}`)
  } catch (error) {
    console.error('ERROR INSERTING EVENT', error)
  }
}

/**
 * Get the latest event ID from the database
 * @returns Latest event ID
 */
export async function getLatestEvent(): Promise<number | undefined> {
  try {
    const event = await db
      .selectFrom('event')
      .selectAll()
      .orderBy('id', 'desc')
      .limit(1)
      .executeTakeFirst()

    return event?.id
  } catch (error) {
    console.error('ERROR GETTING LATEST EVENT', error)
  }
}
