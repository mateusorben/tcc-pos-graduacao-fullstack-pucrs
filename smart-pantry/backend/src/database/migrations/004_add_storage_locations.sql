CREATE TABLE IF NOT EXISTS storage_locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS storage_location_id INTEGER REFERENCES storage_locations(id) ON DELETE SET NULL;
