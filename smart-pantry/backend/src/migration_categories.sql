CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- NULL indicates a system default category
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure unique category names per user (taking NULL into account requires a unique index or just application logic, 
-- but for simplicity let's stick to simple constraints or application checks. 
-- For system defaults (user_id IS NULL), we want uniqueness too).

-- Seed System Default Categories
INSERT INTO categories (name, user_id) VALUES 
('Grãos/Cereais', NULL),
('Laticínios', NULL),
('Carnes', NULL),
('Frutas/Verduras', NULL),
('Bebidas', NULL),
('Limpeza', NULL),
('Outros', NULL)
ON CONFLICT DO NOTHING;
