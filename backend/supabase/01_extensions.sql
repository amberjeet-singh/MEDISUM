-- 01_extensions.sql
-- Run this in the Supabase SQL Editor manually.

-- Required extensions for Medisum backend
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Add any vector/pgvector extensions later if embeddings are stored in pgvector.
-- CREATE EXTENSION IF NOT EXISTS "vector";
