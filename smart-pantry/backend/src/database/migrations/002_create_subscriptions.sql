CREATE TABLE IF NOT EXISTS public.subscriptions (
	id serial4 NOT NULL,
	user_id int4 NULL,
	endpoint text NOT NULL,
	"keys" jsonb NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT subscriptions_endpoint_key UNIQUE (endpoint),
	CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
	CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
