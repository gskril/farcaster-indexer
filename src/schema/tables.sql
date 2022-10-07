-- Profile Table Definition
CREATE TABLE profiles (
  "id" int8 NOT NULL PRIMARY KEY,
  "address" text NOT NULL,
  "username" text,
  "display_name" text,
  "avatar_url" text,
  "avatar_verified" bool,
  "followers" int8,
  "following" int8,
  "bio" text,
  "telegram" text,
  "referrer" text,
  "connected_address" text,
  "registered_at" timestamptz,
  "updated_at" timestamptz DEFAULT now()
);

-- Casts Table Definition
CREATE TABLE casts (
  "type" text,
  "published_at" timestamptz,
  "sequence" int8,
  "address" text,
  "username" text,
  "text" text,
  "reply_parent_merkle_root" text,
  "prev_merkle_root" text,
  "signature" text,
  "merkle_root" text NOT NULL PRIMARY KEY,
  "thread_merkle_root" text,
  "display_name" text,
  "avatar_url" text,
  "avatar_verified" bool,
  "mentions" jsonb,
  "num_reply_children" int8,
  "reply_parent_username" text,
  "reply_parent_address" text,
  "reactions" int8,
  "recasts" int8,
  "watches" int8,
  "recasters" jsonb,
  "deleted" bool
);

-- Function to allow regex searching via Supabase API
CREATE OR REPLACE FUNCTION casts_regex (regex text)
RETURNS SETOF casts LANGUAGE sql
AS $function$
  SELECT * FROM casts WHERE text ~ regex;
$function$;
