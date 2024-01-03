CREATE OR REPLACE FUNCTION find_casts_by_domain(domain text)
RETURNS SETOF casts AS $$
BEGIN
  RETURN QUERY
    SELECT *
    FROM casts
    WHERE EXISTS (
      SELECT 1
      FROM jsonb_array_elements(casts.embeds->'urls') AS urls
      WHERE urls->>'type' = 'url'
        AND (urls->'openGraph'->>'domain') ~ domain
    );
END;
$$ LANGUAGE plpgsql;
