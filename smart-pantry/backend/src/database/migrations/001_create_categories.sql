CREATE TABLE IF NOT EXISTS public.categories (
	id serial4 NOT NULL,
	"name" text NOT NULL,
	user_id int4 NULL,
	CONSTRAINT categories_name_user_id_key UNIQUE (name, user_id),
	CONSTRAINT categories_pkey PRIMARY KEY (id),
	CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Seed System Default Categories
INSERT INTO public.categories (name, user_id) VALUES 
('Grãos/Cereais', NULL),
('Laticínios', NULL),
('Carnes', NULL),
('Frutas/Verduras', NULL),
('Bebidas', NULL),
('Limpeza', NULL),
('Outros', NULL)
ON CONFLICT DO NOTHING;
