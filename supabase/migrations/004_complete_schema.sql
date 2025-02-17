-- Complete schema implementation for CampusConnect

-- Mentorship System Enhancements
CREATE TYPE mentorship_status AS ENUM (
    'active',
    'paused',
    'completed',
    'cancelled'
);

CREATE TYPE meeting_status AS ENUM (
    'scheduled',
    'completed',
    'cancelled',
    'rescheduled'
);

-- Create mentor profiles table first
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT,
    expertise TEXT[],
    years_of_experience INTEGER,
    college_id UUID REFERENCES colleges(id),
    availability JSONB DEFAULT '{"schedule": {}, "timezone": "UTC"}',
    rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
    total_sessions INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_years_experience CHECK (years_of_experience >= 0)
);

-- Enable RLS for mentor_profiles
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;

-- Add policies for mentor_profiles
CREATE POLICY "Anyone can view mentor profiles"
    ON mentor_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their mentor profile"
    ON mentor_profiles FOR ALL
    USING (user_id = auth.uid());

-- Create index for mentor_profiles
CREATE INDEX idx_mentor_profiles_user ON mentor_profiles(user_id);
CREATE INDEX idx_mentor_profiles_college ON mentor_profiles(college_id);

-- Mentorship Sessions & Scheduling
CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES mentor_profiles(id),
    mentee_id UUID REFERENCES profiles(id),
    status mentorship_status DEFAULT 'active',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    goals TEXT[],
    feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5),
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentorship_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES mentorship_sessions(id),
    scheduled_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    meeting_link TEXT,
    status meeting_status DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- College Database Enhancements
CREATE TABLE IF NOT EXISTS college_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id),
    author_id UUID REFERENCES profiles(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    academic_rating INTEGER CHECK (academic_rating BETWEEN 1 AND 5),
    social_rating INTEGER CHECK (social_rating BETWEEN 1 AND 5),
    facilities_rating INTEGER CHECK (facilities_rating BETWEEN 1 AND 5),
    review_text TEXT,
    pros TEXT[],
    cons TEXT[],
    is_verified_student BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS college_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    location TEXT,
    virtual_link TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Moderation Enhancements
CREATE TABLE IF NOT EXISTS content_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    flagger_id UUID REFERENCES profiles(id),
    flag_reason TEXT NOT NULL,
    flag_details TEXT,
    status TEXT DEFAULT 'pending',
    moderator_id UUID REFERENCES profiles(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS moderation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id UUID REFERENCES profiles(id),
    action_type TEXT NOT NULL,
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    action_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics System
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    event_type TEXT NOT NULL,
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_details JSONB,
    measured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS Policies
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- Mentorship Session Policies
CREATE POLICY "Users can view their mentorship sessions"
    ON mentorship_sessions
    FOR SELECT
    USING (mentor_id = auth.uid() OR mentee_id = auth.uid());

CREATE POLICY "Users can create mentorship sessions"
    ON mentorship_sessions
    FOR INSERT
    WITH CHECK (mentor_id = auth.uid() OR mentee_id = auth.uid());

-- College Review Policies
CREATE POLICY "Anyone can view college reviews"
    ON college_reviews
    FOR SELECT
    USING (true);

CREATE POLICY "Verified users can create college reviews"
    ON college_reviews
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_verified = true
        )
    );

-- Create Indexes
CREATE INDEX idx_mentorship_sessions_mentor ON mentorship_sessions(mentor_id);
CREATE INDEX idx_mentorship_sessions_mentee ON mentorship_sessions(mentee_id);
CREATE INDEX idx_college_reviews_college ON college_reviews(college_id);
CREATE INDEX idx_college_events_college ON college_events(college_id);
CREATE INDEX idx_content_flags_content ON content_flags(content_type, content_id);
CREATE INDEX idx_user_analytics_user ON user_analytics(user_id);

-- Add Triggers
CREATE OR REPLACE FUNCTION update_college_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE colleges
    SET rating = (
        SELECT AVG(rating)
        FROM college_reviews
        WHERE college_id = NEW.college_id
    )
    WHERE id = NEW.college_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_college_rating_trigger
    AFTER INSERT OR UPDATE ON college_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_college_rating();

-- Add Comments
COMMENT ON TABLE mentorship_sessions IS 'Tracks ongoing mentorship relationships between mentors and mentees';
COMMENT ON TABLE college_reviews IS 'Verified student reviews of colleges with detailed ratings';
COMMENT ON TABLE content_flags IS 'System for tracking and managing reported content';
COMMENT ON TABLE user_analytics IS 'Tracks user interactions and engagement metrics'; 