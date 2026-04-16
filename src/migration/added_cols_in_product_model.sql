ALTER TABLE
    products
ADD
    COLUMN stock INTEGER DEFAULT 0;

ALTER TABLE
    products
ADD
    COLUMN category TEXT;

ALTER TABLE
    products
ADD
    COLUMN currency TEXT DEFAULT 'INR';