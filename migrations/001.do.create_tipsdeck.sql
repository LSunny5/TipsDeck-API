CREATE TABLE tipsdeck_categories (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL
);

CREATE TABLE tipsdeck_tips (
    id SERIAL PRIMARY KEY,
    category_id SERIAL REFERENCES tipsdeck_categories(id) ON DELETE CASCADE NOT NULL,
    tipname TEXT NOT NULL, 
    tipdescription TEXT NOT NULL, 
    directions TEXT NOT NULL, 
    sourcetitle TEXT, 
    sourceurl TEXT,
    rating NUMERIC (2, 1), 
    numraters INTEGER
);