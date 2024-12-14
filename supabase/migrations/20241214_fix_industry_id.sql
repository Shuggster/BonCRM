-- Fix the industry_id column name
ALTER TABLE contacts RENAME COLUMN industry_icuuid TO industry_id;
