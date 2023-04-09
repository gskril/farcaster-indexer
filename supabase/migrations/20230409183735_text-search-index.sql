CREATE INDEX casts_btree_index ON public.casts USING btree (published_at, deleted, recasts_count, replies_count, watches_count, author_username);

CREATE INDEX casts_text_gin_index ON public.casts USING gin (to_tsvector('english'::regconfig, text));


