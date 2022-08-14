-- Supabase schema

-- Profile Table Definition
CREATE TABLE profiles (
    "index" int8 NOT NULL,
    "merkle_root" text,
    "signature" text,
    "username" text NOT NULL,
    "address_activity" text,
    "avatar" text,
    "proof" text,
    "timestamp" int8,
    "version" int2,
    "connected_address" text,
    PRIMARY KEY ("merkle_root")
);

-- Casts Table Definition
CREATE TABLE casts (
    "published_at" int8 NOT NULL,
    "sequence" int4 NOT NULL,
    "username" text NOT NULL,
    "address" text NOT NULL,
    "text" text NOT NULL,
    "reply_parent_merkle_root" text,
    "prev_merkle_root" text,
    "merkle_root" text NOT NULL,
    "signature" text NOT NULL,
    "display_name" text,
    "avatar" text,
    "is_verified_avatar" bool,
    "num_reply_children" int2,
    "reactions" int2,
    "recasts" int2,
    "watches" int2,
    "reply_parent_username" text,
    PRIMARY KEY ("merkle_root")
);

