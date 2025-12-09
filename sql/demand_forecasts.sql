-- SQL migration: create demand_forecasts table and optional RPC function

CREATE TABLE IF NOT EXISTS public.demand_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  forecast_period text NOT NULL,
  forecast_units integer NOT NULL,
  confidence numeric(3,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unique constraint to upsert by product+period
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_demand_forecasts_product_period'
  ) THEN
    CREATE UNIQUE INDEX idx_demand_forecasts_product_period ON public.demand_forecasts (product_id, forecast_period);
  END IF;
END$$;

-- Optional: a SQL function to generate forecasts on DB side can be added here; for now we provide a JS implementation in the app.

-- Example RPC signature (not implemented here):
-- create or replace function public.generate_demand_forecasts(periods text[] default array['7d','30d']) returns void language plpgsql as $$
-- BEGIN
--   -- Implementation could aggregate transactions and upsert into demand_forecasts
-- END;
-- $$;
