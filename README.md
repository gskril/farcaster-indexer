# Farcaster Indexer

Index all profiles and casts on the Farcaster protocol. Powers the [Farcaster Search API](https://github.com/gskril/farcaster-search).

## How it works

### Profiles:

- On start, upsert all past `Register` events from the [ID Registry](0xda107a1caf36d198b12c16c7b6a1d1c795978c42) to a Supabase table
- Watch the ID Registry for new events and adds them to the table
- Iterate through Farcaster APIs every 2 hours to populate all profile data

### Casts:

- Iterate through Farcaster APIs every 30 minutes and upserts all casts to a Supabase table

## How to use

1. Create a new project on [Supabase](https://supabase.com/) (it's free)
2. Navigate to the SQL editor
3. Paste [this code](/src/schema/tables.sql) to create your tables
4. Rename `.env.example` to `.env` and configure your variables
5. Run `yarn install` to install dependencies
6. Run `yarn start` to start the server

I suggest also creating a duplicate of both tables and appending '\_dev' to the names. Just run `yarn dev` instead of `yarn start` to use the dev tables.
