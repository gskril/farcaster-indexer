-- FARCASTERS WITH VERIFIED PFP

WITH verified_avatar AS (
  SELECT
    COUNT(DISTINCT address)
  FROM
    casts
  WHERE
    is_verified_avatar = TRUE
),
total_casters AS (
  SELECT
    COUNT(DISTINCT address)
  FROM
    casts
)

SELECT * FROM verified_avatar
UNION
SELECT * FROM total_casters;

-- END FARCASTERS WITH VERIFIED PFP


-- NUMBER OF CASTS IN THE LAST 30 DAYS
SELECT COUNT(*) FROM casts WHERE to_timestamp(published_at / 1000)::date > NOW() - INTERVAL '30 DAY';


-- NUMBER OF DAILY ACTIVE CASTERS
SELECT COUNT(DISTINCT(address)) FROM casts WHERE to_timestamp(published_at / 1000)::date > NOW() - INTERVAL '1 DAY';