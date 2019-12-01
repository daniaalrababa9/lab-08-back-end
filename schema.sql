
DROP TABLE IF EXISTS locations;

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_address VARCHAR(255),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7)
);

