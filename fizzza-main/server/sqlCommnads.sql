CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    surname VARCHAR(255),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    phone VARCHAR(255),
    address VARCHAR(255),
    role VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    delivery_address TEXT,
    payment_method VARCHAR(255),
    status VARCHAR(255) DEFAULT 'pending',
    comment TEXT,
    full_price VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_name VARCHAR(255),
    quantity INTEGER,
    price VARCHAR(255)
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    date VARCHAR(20),
    time VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comment (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title TEXT,
    description TEXT,
    rating VARCHAR(100),
    city VARCHAR(100),
);


ALTER TABLE orders
ADD CONSTRAINT fk_orders_users
FOREIGN KEY (user_id) 
REFERENCES users(id);