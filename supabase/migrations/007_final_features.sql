-- Drop existing objects in correct order
DROP FUNCTION IF EXISTS reset_rate_limits();
DROP FUNCTION IF EXISTS cleanup_expired_cache();
DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS cache_entries;
DROP TABLE IF EXISTS user_activities;
DROP TABLE IF EXISTS scheduled_notifications;
DROP TABLE IF EXISTS notification_templates;
DROP TYPE IF EXISTS notification_priority;

-- Notification System Enhancement
CREATE TYPE notification_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- Notification Templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Notifications
CREATE TABLE scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES notification_templates(id),
    recipient_id UUID REFERENCES profiles(id),
    scheduled_for TIMESTAMPTZ NOT NULL,
    variables JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    priority notification_priority DEFAULT 'low',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Tracking
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    activity_type TEXT NOT NULL,
    activity_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cache Management
CREATE TABLE cache_entries (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate Limiting
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    endpoint TEXT NOT NULL,
    requests INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Only admins can manage notification templates"
    ON notification_templates
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can view their scheduled notifications"
    ON scheduled_notifications
    FOR SELECT
    USING (recipient_id = auth.uid());

CREATE POLICY "Users can view their activities"
    ON user_activities
    FOR SELECT
    USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_scheduled_notifications_recipient 
    ON scheduled_notifications(recipient_id, scheduled_for);
CREATE INDEX idx_user_activities_user 
    ON user_activities(user_id, created_at DESC);
CREATE INDEX idx_cache_entries_expiry 
    ON cache_entries(expires_at);
CREATE INDEX idx_rate_limits_window 
    ON rate_limits(user_id, endpoint, window_start);

-- Cleanup Function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM cache_entries WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Reset Rate Limits Function
CREATE OR REPLACE FUNCTION reset_rate_limits()
RETURNS void AS $$
BEGIN
    UPDATE rate_limits 
    SET requests = 0, window_start = NOW()
    WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Add Comments
COMMENT ON TABLE notification_templates IS 'Templates for system notifications';
COMMENT ON TABLE scheduled_notifications IS 'Scheduled notifications for users';
COMMENT ON TABLE user_activities IS 'Track user activities for analytics and security';
COMMENT ON TABLE cache_entries IS 'System-wide cache storage';
COMMENT ON TABLE rate_limits IS 'API rate limiting by user and endpoint'; 