CREATE INDEX casts_btree_index ON public.casts USING btree (published_at, deleted, recasts_count, replies_count, watches_count, author_username);

ALTER TABLE casts
	ADD COLUMN fts tsvector GENERATED always AS (
to_tsvector('english', text)) stored;

CREATE INDEX casts_fts ON casts
USING GIN (fts);