alter table "public"."signer" drop constraint "signer_fid_fkey";

alter table "public"."reaction" drop constraint "reaction_pkey";

drop index if exists "public"."reaction_pkey";

CREATE UNIQUE INDEX reaction_pkey ON public.reaction USING btree (fid, target_cast, type);

alter table "public"."reaction" add constraint "reaction_pkey" PRIMARY KEY using index "reaction_pkey";


