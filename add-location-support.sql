-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location columns to services table
ALTER TABLE "Service" 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS "postalCode" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "serviceRadiusKm" DOUBLE PRECISION DEFAULT 10,
ADD COLUMN IF NOT EXISTS "locationLastUpdated" TIMESTAMP(3);

-- Create location column using PostGIS POINT type
ALTER TABLE "Service" 
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- Create spatial index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_location ON "Service" USING GIST(location);

-- Create regular indexes for location fields
CREATE INDEX IF NOT EXISTS idx_services_lat_lng ON "Service" (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_services_city ON "Service" (city);
CREATE INDEX IF NOT EXISTS idx_services_state ON "Service" (state);

-- Function to update geography column when lat/lng changes
CREATE OR REPLACE FUNCTION update_service_location() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
        NEW."locationLastUpdated" = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update location column
DROP TRIGGER IF EXISTS trigger_update_service_location ON "Service";
CREATE TRIGGER trigger_update_service_location
    BEFORE INSERT OR UPDATE OF latitude, longitude
    ON "Service"
    FOR EACH ROW
    EXECUTE FUNCTION update_service_location();