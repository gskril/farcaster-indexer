alter table "public"."casts" add column "embeds" jsonb;

alter table "public"."casts" add column "tags" jsonb[];

CREATE INDEX idx_embeds ON "public"."casts" USING GIN ("embeds");

CREATE OR REPLACE FUNCTION find_casts_by_url(dynamic_url TEXT)
RETURNS SETOF casts AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM casts
    WHERE embeds @> jsonb_build_object('urls', jsonb_build_array(jsonb_build_object('openGraph', jsonb_build_object('url', dynamic_url))));
END;
$$ LANGUAGE plpgsql;