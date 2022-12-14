-- Update table names
CREATE OR REPLACE FUNCTION public.get_profile_by_address(connected_address text)
 RETURNS SETOF profile
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY SELECT p.*
  FROM profile p
  INNER JOIN verification v
  ON p.id = v.fid
  WHERE v.address ilike connected_address
  GROUP BY p.id;
END;
$function$;

-- Create new view that joins the tables 'profile' and 'verification'
CREATE OR REPLACE VIEW public.profile_with_verification AS
SELECT
	profile.*,
	jsonb_agg((to_jsonb (verification.*) - 'fid')
ORDER BY
	verification.created_at) AS verifications
FROM
	profile
	LEFT OUTER JOIN verification ON profile.id = verification.fid
GROUP BY
	profile.id;
