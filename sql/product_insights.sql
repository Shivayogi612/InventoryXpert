-- SQL migration: create product_insights table to store AI demand insights

CREATE TABLE IF NOT EXISTS public.product_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  trend_label text,
  recommendation text,
  summary text,
  stock_advice text,
  risk_factors text[],
  suggested_actions text[],
  ai_raw jsonb,
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_product_insights_product'
  ) THEN
    CREATE UNIQUE INDEX idx_product_insights_product ON public.product_insights (product_id);
  END IF;
END$$;
