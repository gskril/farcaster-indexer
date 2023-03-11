# Farcaster Indexer (wip)

This is an indexer that runs alongside [Hubble](https://github.com/farcasterxyz/hubble), a Typescript implementation of a [Farcaster Hub](https://github.com/farcasterxyz/protocol#4-hubs).

It listens for messages from a Hub and updates a Postgres database with the latest state of the network.

## Notes

- Hubs don't sync with each other yet, so the only way to test this with real data is to send messages to a local Hubble instance. This is what I do in [dummy.ts](src/helpers/dummy.ts).
- I'm using Supabase as a database provider right now, but plan to switch to a more generalized Postgres ORM soon.
