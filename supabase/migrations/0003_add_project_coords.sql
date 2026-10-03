-- Add geospatial coordinates to projects table
-- Default to random points within the Bhopal city bounding box if not provided
-- Bhopal roughly: Latitude 23.24 to 23.28, Longitude 77.39 to 77.44

ALTER TABLE projects
  ADD COLUMN latitude numeric DEFAULT (23.24 + random() * 0.04),
  ADD COLUMN longitude numeric DEFAULT (77.39 + random() * 0.05);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
