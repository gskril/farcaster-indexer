# Farcaster Indexer (wip)

This is an indexer that listens for messages from a [Farcaster Hub](https://github.com/farcasterxyz/protocol#4-hubs) and inserts all relevant data into a postgres databse.

## Notes

- Farcaster Hubs are current running on testnet.
  - There are some messages broadcasted by others, but the only way to test all message types is to send your own.
  - If you want to send test messages, you'll need to edit the `account` constant in in [dummy.ts](src/helpers/dummy.ts) and set your `FARCASTER_PRIVATE_KEY` in `.env` to be your own Farcaster account.
- I'm using Supabase as a database provider right now (follow the instructions in README.md on `main` to set that up locally), but plan to switch to a more generalized Postgres ORM soon.
