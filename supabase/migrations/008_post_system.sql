-- Post System Enhancement
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id),
    college_id UUID REFERENCES colleges(id),
    content TEXT NOT NULL,
    media_urls TEXT[],
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    interaction_type TEXT NOT NULL, -- 'like', 'save', 'share'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES post_comments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_college ON posts(college_id);
CREATE INDEX idx_post_interactions_post ON post_interactions(post_id);
CREATE INDEX idx_post_comments_post ON post_comments(post_id); 