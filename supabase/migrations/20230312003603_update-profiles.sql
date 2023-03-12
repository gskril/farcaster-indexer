drop view if exists "public"."profile_with_verification";

alter table "public"."profile" drop column "avatar_verified";

alter table "public"."profile" drop column "followers";

alter table "public"."profile" drop column "following";

alter table "public"."profile" drop column "referrer";

alter table "public"."profile" add column "url" text;

create or replace view "public"."profile_with_verification" as  SELECT profile.id,
    profile.owner,
    profile.username,
    profile.display_name,
    profile.avatar_url,
    profile.bio,
    profile.url,
    profile.registered_at,
    profile.updated_at,
    jsonb_agg((to_jsonb(verification.*) - 'fid'::text) ORDER BY verification.created_at) AS verifications
   FROM (profile
     LEFT JOIN verification ON ((profile.id = verification.fid)))
  GROUP BY profile.id;



