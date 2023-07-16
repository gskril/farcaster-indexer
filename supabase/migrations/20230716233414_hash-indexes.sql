CREATE INDEX casts_hash_v1_idx ON public.casts USING btree (hash_v1);

CREATE INDEX casts_parent_hash_idx ON public.casts USING btree (parent_hash);

CREATE INDEX casts_parent_hash_v1_idx ON public.casts USING btree (parent_hash_v1);
