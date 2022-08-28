# Farcaster Indexer

Index all profiles and casts on the Farcaster protocol. Powers the [Farcaster Search API](https://github.com/gskril/farcaster-search).

## How it works

The [Farcaster Registry](https://rinkeby.etherscan.io/address/0xe3Be01D99bAa8dB9905b33a3cA391238234B79D1) has functions `usernamesLength()` and `usernameAtIndex()`.

This script iterates over `usernameAtIndex()` and returns profiles' [host directory](https://www.farcaster.xyz/docs/host). Data from directories and an additional client-side API is saved to a [Supabase](https://supabase.com/) table called `profiles`.

In a seperate process, all casts from each profile are saved to a table called `casts`.

## How to use

1. Create a new project on [Supabase](https://supabase.com/) (it's free)
2. Navigate to the SQL editor
3. Paste [this code](/src/schema/tables.sql) to create your tables
4. Rename `.env.example` to `.env` and configure your variables
5. Run `yarn install` to install dependencies
6. Run `yarn start` to start the server
