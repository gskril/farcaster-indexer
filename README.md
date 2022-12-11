# Farcaster Indexer

Index all profiles and casts on the Farcaster protocol using [Merkle Manufactory APIs](https://api.farcaster.xyz/docs). Powers [Searchcaster](https://searchcaster.xyz/), [Fardrop](https://fardrop.xyz/) and others.

Soon, both profiles and casts will read from [Farcaster Hubs](https://github.com/farcasterxyz/hub) instead of client APIs.

## How to run locally

Create a new Supabase project via [CLI](https://supabase.com/docs/reference/cli). This will create all the tables and seed the database.

```
supabase init
```

Rename `.env.example` to `.env` and configure your variables.

```
cp .env.example .env
```

Install dependencies and start the server

```
yarn install
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

I recommend hosting the indexer on [Railway](https://railway.app?referralCode=ONtqGs)
