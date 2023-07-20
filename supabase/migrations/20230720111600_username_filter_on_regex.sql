CREATE OR REPLACE FUNCTION casts_regex_by_user(regex TEXT, username TEXT DEFAULT NULL)
RETURNS SETOF casts AS 
$$
BEGIN
    IF username IS NULL THEN
        RETURN QUERY SELECT * FROM casts WHERE text ~ regex;
    ELSE
        RETURN QUERY SELECT * FROM casts WHERE text ~ regex AND author_username = username;
    END IF;
END;
$$ LANGUAGE plpgsql;
