alter table "public"."casts" drop constraint "casts_author_fid_fkey";

alter table "public"."casts" drop constraint "casts_parent_author_fid_fkey";

alter table "public"."casts" drop column "author_display_name";

alter table "public"."casts" drop column "author_fid";

alter table "public"."casts" drop column "author_pfp_url";

alter table "public"."casts" drop column "author_pfp_verified";

alter table "public"."casts" drop column "author_username";

alter table "public"."casts" drop column "hash_v1";

alter table "public"."casts" drop column "parent_author_fid";

alter table "public"."casts" drop column "parent_author_username";

alter table "public"."casts" drop column "parent_hash_v1";

alter table "public"."casts" drop column "reactions_count";

alter table "public"."casts" drop column "recasts_count";

alter table "public"."casts" drop column "replies_count";

alter table "public"."casts" drop column "thread_hash_v1";

alter table "public"."casts" drop column "watches_count";

alter table "public"."casts" add column "fid" integer not null;

alter table "public"."casts" add column "parent_fid" bigint;

alter table "public"."casts" add column "signature" text not null;

alter table "public"."casts" add column "signer" text not null;

alter table "public"."casts" alter column "deleted" set not null;

alter table "public"."casts" alter column "thread_hash" drop not null;

alter table "public"."casts" add constraint "casts_fid_fkey" FOREIGN KEY (fid) REFERENCES profile(id) not valid;

alter table "public"."casts" validate constraint "casts_fid_fkey";

alter table "public"."casts" add constraint "casts_parent_fid_fkey" FOREIGN KEY (parent_fid) REFERENCES profile(id) not valid;

alter table "public"."casts" validate constraint "casts_parent_fid_fkey";

alter table "public"."casts" add constraint "casts_parent_hash_fkey" FOREIGN KEY (parent_hash) REFERENCES casts(hash) not valid;

alter table "public"."casts" validate constraint "casts_parent_hash_fkey";

alter table "public"."casts" add constraint "casts_thread_hash_fkey" FOREIGN KEY (thread_hash) REFERENCES casts(hash) not valid;

alter table "public"."casts" validate constraint "casts_thread_hash_fkey";


