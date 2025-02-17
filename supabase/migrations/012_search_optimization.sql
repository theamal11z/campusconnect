
-- Add GiST index for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for commonly searched columns
CREATE INDEX idx_colleges_name ON colleges USING GiST (name gist_trgm_ops);
CREATE INDEX idx_colleges_location ON colleges USING GiST (location gist_trgm_ops);
CREATE INDEX idx_colleges_type ON colleges (type);
CREATE INDEX idx_colleges_ranking ON colleges (ranking);

-- Create a composite index for combined filters
CREATE INDEX idx_colleges_type_ranking ON colleges (type, ranking);
