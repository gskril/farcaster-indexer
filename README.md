# Farcaster Indexer

This is an indexer that listens for messages from a [Farcaster Hub](https://docs.farcaster.xyz/learn/architecture/hubs) and inserts relevant data into a postgres database.

## How to run

Clone this repo

```bash
git clone -b hubs https://github.com/gskril/farcaster-indexer.git
```

Install dependencies

```bash
yarn install
```

Create a `.env` file with hub and database connection details

```bash
cp .env.example .env
```

Run the indexer

```bash
yarn start
```

## Notes

- Initial sync will take a long time (benchmarks to come). Use a local hub and postgres instance for the fastest results
- If you start reading from a different hub or the indexer is offline for more than 3 days, it will need to do a full sync again

## Todo

- [x] Subscribe to a hub's stream
- [x] Backfill select data from all FIDs
- [x] Handle messages in batches (e.g. queue up 1,000 messages of the same type and insert them on a schedule)
- [ ] Handle REVOKE_MESSAGE messages
- [ ] Improve handling of messages that arrive out of order (e.g. a MESSAGE_TYPE_CAST_REMOVE arriving before a MESSAGE_TYPE_CAST_ADD). Merkle's replicator enforces foreign key constraints to ensure that the data is consistent, and implements retry logic to handle out-of-order messages. Maybe instead we could store delete messages in a separate table and apply them after the fact?
- [ ] Improve shutdown process to ensure no messages are lost (e.g. recover messages that are currently in queue). Maybe save ids every x messages so we don't have to depend on `handleShutdownSignal()`?
