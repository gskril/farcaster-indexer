# Farcaster Indexer

Index all profiles and casts on the Farcaster protocol using [Merkle Manufactory APIs](https://api.farcaster.xyz/docs). Powers [Searchcaster](https://searchcaster.xyz/), [Fardrop](https://fardrop.xyz/) and others.

Soon, both profiles and casts will read from [Farcaster Hubs](https://github.com/farcasterxyz/hub) instead of client APIs.

## How to run locally

Create a new Supabase project via [CLI](https://supabase.com/docs/reference/cli). This will create all the tables for you.

```
supabase init
```

Rename `.env.example` to `.env` and configure your variables.

```
cp .env.example .env
```

If you don't have a Merkle auth token yet, set the `FC_MNEMONIC` environment variable to your Farcaster recovery phrase and run the following command to generate a token.

```
yarn install
yarn run auth
```

Run the indexer. If you're running it for the first time and want to fetch all historical casts, temporarily remove the number argument from `indexAllCasts()` on line ~45 of [index.ts](./src/index.ts).

```
yarn start
```

## How to deploy

Create a [Supabase](https://supabase.com/) account and empty project. Connect to the CLI using your Postgres connection string under Project Settings > Database.

```
supabase db remote set postgres://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxxxxxxxxx.supabase.co:5432/postgres
```

Push your database schema

```
supabase db push
```

I recommend hosting the indexer on [Railway](https://railway.app?referralCode=ONtqGs).
