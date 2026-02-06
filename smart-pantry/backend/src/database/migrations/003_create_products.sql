CREATE TABLE IF NOT EXISTS public.products (
	id serial4 NOT NULL,
	"name" text NOT NULL,
	obs text NULL,
	quantity int4 DEFAULT 1 NULL,
	min_quantity int4 DEFAULT 0 NULL,
	expiry_date date NOT NULL,
	category_id int4 NULL,
	user_id int4 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT products_pkey PRIMARY KEY (id),
	CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
	CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
