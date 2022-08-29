-- Unique profiles publishing casts by day
SELECT
  to_timestamp(published_at / 1000)::date AS date,
  count(DISTINCT address) AS count
FROM
  casts
GROUP BY
  (to_timestamp((published_at / 1000))::date)
ORDER BY
  (to_timestamp((published_at / 1000))::date)
  DESC;


-- Total market cap of Farcaster connected addresses
SELECT SUM(wallet_balance) FROM profiles;


-- Casts per hour over the last 7 days with day label
SELECT
  date_trunc('hour', (to_timestamp(casts.published_at / 1000))) AS hour,
  COUNT(*) AS num_casts,
  date_part('dow', (to_timestamp(casts.published_at / 1000))) AS dow
FROM casts
WHERE (to_timestamp(casts.published_at / 1000) > (now() - interval '7 days'))
GROUP BY hour, dow
ORDER BY dow, hour ASC;


-- List of unique monthly casters
SELECT DISTINCT
  address
FROM
  casts
WHERE
  to_timestamp((casts.published_at / 1000))::date > (now() - '30 days'::interval);


-- Number of unique casters per week over the last year
SELECT
  date_trunc('week', (to_timestamp(casts.published_at / 1000))) AS week,
  COUNT(DISTINCT address) AS count
FROM casts
WHERE (to_timestamp(casts.published_at / 1000) > (now() - interval '1 year'))
GROUP BY week
ORDER BY week DESC;


-- Farcaster profiles with verified NFT avatar
WITH verified_avatar AS (
  SELECT COUNT(DISTINCT address)
  FROM casts
  WHERE is_verified_avatar = TRUE
),
total_casters AS (
  SELECT COUNT(DISTINCT address)
  FROM casts
)

SELECT * FROM verified_avatar
UNION
SELECT * FROM total_casters;
