-- User Relationships
CREATE TABLE user_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES profiles(id),
    following_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX idx_user_relationships_follower ON user_relationships(follower_id);
CREATE INDEX idx_user_relationships_following ON user_relationships(following_id); 