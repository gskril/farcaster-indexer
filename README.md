# Farcaster Indexer

Index all profiles and casts on the Farcaster protocol using [Merkle Manufactory APIs](https://api.farcaster.xyz/docs). Powers [Searchcaster](https://searchcaster.xyz/), [Fardrop](https://fardrop.xyz/) and others.

Soon, both profiles and casts will read from [Farcaster Hubs](https://github.com/farcasterxyz/hub) instead of client APIs.

## How to run locally

Requirements: [Node.js](https://nodejs.org/en/download/), [Yarn](https://classic.yarnpkg.com/en/docs/install/), [Docker](https://docs.docker.com/get-docker/), [Supabase CLI](https://supabase.com/docs/guides/cli)

Create a local Supabase instance. This will create all the tables for you.

```
supabase start
```

Rename `.env.example` to `.env` and configure your variables with the credentials generated from the previous step.

```
cp .env.example .env
```

If you don't have a Merkle auth token yet, set the `FC_MNEMONIC` environment variable to your Farcaster recovery phrase and run the following command to generate a token.

```
yarn install
yarn run auth
```

Seed your database with protocol data. This will take ~5-10 minutes for profiles and casts (default), or ~30 minutes for everything (include the `--verifications` flag).

```
yarn run seed
# or
yarn run seed --verifications
```

The Merkle APIs don't include a registration timestamp for users. For new registrations, we get the timestamp by watching events on the ID Registry contract. If you were running the previous version of this indexer, you can migrate this data. Otherwise you can skip this step.

```
yarn run migrate
```

Run the indexer

```
yarn start
```

## How to deploy

Create a [Supabase](https://supabase.com/) account and empty project. Connect to the CLI using your Postgres connection string under Project Settings > Database.

```
supabase login
supabase link --project ref [proj_ref]
```

Push your database schema

```
supabase db push
```

I recommend hosting the indexer on [Railway](https://railway.app?referralCode=ONtqGs).
