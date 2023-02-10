drop view if exists "public"."profile_with_verification";

alter table "public"."profile" drop column "followers_fids";

alter table "public"."profile" drop column "followers_fnames";

alter table "public"."profile" add column "follower_fids" integer[];

alter table "public"."profile" add column "follower_fnames" text[];

alter table "public"."profile" add column "following_fids" integer[];

alter table "public"."profile" add column "following_fnames" text[];

create or replace view "public"."profile_with_verification" as  SELECT profile.id,
    profile.owner,
    profile.username,
    profile.display_name,
    profile.avatar_url,
    profile.avatar_verified,
    profile.followers,
    profile.following,
    profile.bio,
    profile.referrer,
    profile.registered_at,
    profile.updated_at,
    jsonb_agg((to_jsonb(verification.*) - 'fid'::text) ORDER BY verification.created_at) AS verifications
   FROM (profile
     LEFT JOIN verification ON ((profile.id = verification.fid)))
  GROUP BY profile.id;



