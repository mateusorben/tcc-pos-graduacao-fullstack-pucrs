CREATE TABLE IF NOT EXISTS public.users (
	id serial4 NOT NULL,
	"name" text NULL,
	email text NOT NULL,
	"password" text NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
