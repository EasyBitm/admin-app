
-- =============================================
-- easyBITM User Authentication & Progress Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable Row Level Security on all tables
-- =============================================

-- 1. PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. STUDIES TABLE (Study subjects/topics)
-- =============================================
CREATE TABLE studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject_type TEXT, -- e.g., 'BITM Semester 1', 'CMAT', 'Programming'
  total_topics INTEGER DEFAULT 0,
  completed_topics INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  progress_percentage NUMERIC(5,2) DEFAULT 0,
  color TEXT, -- for visual categorization
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own studies"
  ON studies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own studies"
  ON studies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own studies"
  ON studies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own studies"
  ON studies FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. PROGRESS ENTRIES TABLE (Detailed progress tracking)
-- =============================================
CREATE TABLE progress_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic_name TEXT NOT NULL,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  notes TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  score INTEGER, -- for quizzes/tests
  max_score INTEGER,
  last_studied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress entries"
  ON progress_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress entries"
  ON progress_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress entries"
  ON progress_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress entries"
  ON progress_entries FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 4. MILESTONES TABLE (Achievement tracking)
-- =============================================
CREATE TABLE milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'star',
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones"
  ON milestones FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 5. FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update study progress percentage
CREATE OR REPLACE FUNCTION update_study_progress(study_id_param UUID)
RETURNS void AS $$
DECLARE
  total_topics INTEGER;
  completed_topics INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_topics
  FROM progress_entries
  WHERE study_id = study_id_param;

  SELECT COUNT(*) INTO completed_topics
  FROM progress_entries
  WHERE study_id = study_id_param AND status = 'completed';

  UPDATE studies
  SET 
    total_topics = total_topics,
    completed_topics = completed_topics,
    progress_percentage = CASE 
      WHEN total_topics = 0 THEN 0 
      ELSE (completed_topics::NUMERIC / total_topics::NUMERIC * 100) 
    END,
    updated_at = NOW()
  WHERE id = study_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update progress when progress_entries change
CREATE OR REPLACE FUNCTION trigger_update_study_progress()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_study_progress(NEW.study_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_progress_entry_change
  AFTER INSERT OR UPDATE OR DELETE ON progress_entries
  FOR EACH ROW EXECUTE FUNCTION trigger_update_study_progress();

-- =============================================
-- 6. STORAGE BUCKET FOR AVATARS
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for avatar uploads
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- 7. SAMPLE DATA (Optional - for testing)
-- =============================================

-- Useful indexes for performance
CREATE INDEX idx_studies_user_id ON studies(user_id);
CREATE INDEX idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX idx_progress_entries_study_id ON progress_entries(study_id);
CREATE INDEX idx_milestones_user_id ON milestones(user_id);

COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON TABLE studies IS 'Study subjects/topics a user is tracking';
COMMENT ON TABLE progress_entries IS 'Individual topic progress within a study';
COMMENT ON TABLE milestones IS 'Achievements and milestones earned by users';
