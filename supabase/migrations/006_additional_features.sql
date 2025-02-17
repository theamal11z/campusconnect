-- Search and Discovery Enhancement
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- College Tags for Better Discovery
CREATE TABLE college_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences for Recommendations
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_colleges UUID[] DEFAULT '{}',
    preferred_subjects TEXT[] DEFAULT '{}',
    location_preference GEOGRAPHY(POINT),
    notification_settings JSONB DEFAULT '{
        "email_notifications": true,
        "push_notifications": true,
        "message_notifications": true
    }',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File Management
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    content_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE college_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view college tags"
    ON college_tags FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their preferences"
    ON user_preferences
    FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their files"
    ON file_uploads
    FOR ALL
    USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_college_tags_college ON college_tags(college_id);
CREATE INDEX idx_college_tags_tag ON college_tags USING gin(tag gin_trgm_ops);
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_file_uploads_user ON file_uploads(user_id); 