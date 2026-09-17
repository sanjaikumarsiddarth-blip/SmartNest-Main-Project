-- ==============================================================================
-- SMARTNEST AI — SUPABASE POSTGRESQL SCHEMA
-- Intelligence & Automation Infrastructure
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. BUYER PREFERENCES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buyer_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget NUMERIC NOT NULL,
  city TEXT NOT NULL DEFAULT 'Coimbatore',
  preferred_bhk INTEGER NOT NULL DEFAULT 2,
  property_types TEXT[] DEFAULT ARRAY['Apartment']::TEXT[],
  workplace TEXT DEFAULT 'Tidel Park Coimbatore',
  max_commute INTEGER DEFAULT 30, -- in minutes
  commute_mode TEXT DEFAULT 'Car',
  school_importance TEXT DEFAULT 'high', -- 'high' | 'medium' | 'low'
  max_school_distance NUMERIC DEFAULT 5.0, -- in km
  hospital_importance TEXT DEFAULT 'medium',
  max_hospital_distance NUMERIC DEFAULT 5.0,
  noise_pref TEXT DEFAULT 'quiet', -- 'quiet' | 'moderate' | 'any'
  park_walking BOOLEAN DEFAULT true,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  priorities TEXT[] DEFAULT ARRAY['commute', 'budget', 'schools']::TEXT[],
  dealbreakers JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast buyer preference lookups
CREATE INDEX IF NOT EXISTS idx_buyer_preferences_buyer ON buyer_preferences(buyer_id);

-- RLS for buyer_preferences
ALTER TABLE buyer_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view and edit their own preferences"
  ON buyer_preferences
  FOR ALL
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- ------------------------------------------------------------------------------
-- 2. COMPATIBILITY SCORES TABLE
-- Deterministic 0-100 score + explainable breakdown
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compatibility_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL, -- UUID or alphanumeric reference (e.g. 'P01')
  overall_score NUMERIC NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  category TEXT NOT NULL CHECK (category IN ('DIAMOND', 'GOLD', 'SILVER', 'LOWER')),
  score_breakdown JSONB NOT NULL,
  strengths JSONB DEFAULT '[]'::JSONB,
  tradeoffs JSONB DEFAULT '[]'::JSONB,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_buyer_property_compatibility UNIQUE (buyer_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_compatibility_scores_buyer ON compatibility_scores(buyer_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_prop ON compatibility_scores(property_id);

ALTER TABLE compatibility_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own compatibility results"
  ON compatibility_scores
  FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "System/Service can insert/update compatibility scores"
  ON compatibility_scores
  FOR ALL
  USING (auth.uid() = buyer_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = buyer_id OR auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 3. COMPARISON RESULTS TABLE
-- AI Comparison Intelligence between two properties
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comparison_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_1_id TEXT NOT NULL,
  property_2_id TEXT NOT NULL,
  winner_property_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  property_1_analysis JSONB NOT NULL,
  property_2_analysis JSONB NOT NULL,
  tradeoffs JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comparison_results_buyer ON comparison_results(buyer_id);

ALTER TABLE comparison_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own comparison results"
  ON comparison_results
  FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can store comparison results"
  ON comparison_results
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id OR auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 4. PROPERTY PRICE HISTORY TABLE
-- Immutable historical record of every price alteration
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS property_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL,
  old_price NUMERIC NOT NULL,
  new_price NUMERIC NOT NULL,
  change_amount NUMERIC NOT NULL,
  change_percentage NUMERIC NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_prop ON property_price_history(property_id);
CREATE INDEX IF NOT EXISTS idx_price_history_time ON property_price_history(changed_at DESC);

ALTER TABLE property_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read property price history"
  ON property_price_history
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Sellers and Admins can insert price history"
  ON property_price_history
  FOR INSERT
  WITH CHECK (auth.uid() = changed_by OR auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 5. NOTIFICATIONS TABLE (Deduplicated In-App Alerts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'price_drop', -- 'price_drop' | 'offer_alert' | 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  property_id TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  deduplication_key TEXT NOT NULL UNIQUE, -- e.g. "P01_price_drop_8200000_to_7400000_usr_buyer_01"
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read = false;
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedup ON notifications(deduplication_key);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage own notifications"
  ON notifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. WISHLISTS / SHORTLISTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shortlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_buyer_shortlist UNIQUE (buyer_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_shortlists_buyer ON shortlists(buyer_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_prop ON shortlists(property_id);

ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view and manage their shortlist"
  ON shortlists
  FOR ALL
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);
