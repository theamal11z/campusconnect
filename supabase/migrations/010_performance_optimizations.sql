-- Performance Optimizations

-- Composite Indexes for Common Queries
CREATE INDEX IF NOT EXISTS idx_posts_college_created 
    ON posts(college_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mentorship_status_date 
    ON mentorship_sessions(status, start_date);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_date 
    ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_college_reviews_rating_date 
    ON college_reviews(college_id, rating DESC, created_at DESC);

-- Materialized Views for Heavy Queries

-- College Statistics
CREATE MATERIALIZED VIEW mv_college_stats AS
SELECT 
    c.id,
    c.name,
    COUNT(DISTINCT r.id) as review_count,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT p.id) as post_count,
    COUNT(DISTINCT m.id) as mentor_count,
    (
        SELECT COUNT(*)
        FROM user_analytics ua
        WHERE ua.event_data->>'college_id' = c.id::text
        AND ua.created_at > NOW() - INTERVAL '30 days'
    ) as monthly_interactions
FROM colleges c
LEFT JOIN college_reviews r ON c.id = r.college_id
LEFT JOIN posts p ON c.id = p.college_id
LEFT JOIN mentor_profiles m ON c.id = m.college_id
GROUP BY c.id, c.name;

-- User Activity Summary
CREATE MATERIALIZED VIEW mv_user_activity AS
SELECT 
    p.id as user_id,
    p.full_name,
    COUNT(DISTINCT po.id) as post_count,
    COUNT(DISTINCT pc.id) as comment_count,
    COUNT(DISTINCT pi.id) FILTER (WHERE pi.interaction_type = 'like') as like_count,
    COUNT(DISTINCT ur_following.id) as following_count,
    COUNT(DISTINCT ur_followers.id) as follower_count,
    MAX(po.created_at) as last_post_date,
    MAX(m.created_at) as last_message_date
FROM profiles p
LEFT JOIN posts po ON p.id = po.author_id
LEFT JOIN post_comments pc ON p.id = pc.author_id
LEFT JOIN post_interactions pi ON p.id = pi.user_id
LEFT JOIN user_relationships ur_following ON p.id = ur_following.follower_id
LEFT JOIN user_relationships ur_followers ON p.id = ur_followers.following_id
LEFT JOIN messages m ON p.id = m.sender_id
GROUP BY p.id, p.full_name;

-- Trending Content
CREATE MATERIALIZED VIEW mv_trending_posts AS
SELECT 
    p.id,
    p.content,
    p.author_id,
    p.college_id,
    p.created_at,
    COUNT(DISTINCT pi.id) FILTER (WHERE pi.interaction_type = 'like') as like_count,
    COUNT(DISTINCT pc.id) as comment_count,
    COUNT(DISTINCT pi.id) FILTER (WHERE pi.interaction_type = 'share') as share_count,
    (
        COUNT(DISTINCT pi.id) + 
        COUNT(DISTINCT pc.id) * 2 + 
        COUNT(DISTINCT pi.id) FILTER (WHERE pi.interaction_type = 'share') * 3
    ) as engagement_score
FROM posts p
LEFT JOIN post_interactions pi ON p.id = pi.post_id
LEFT JOIN post_comments pc ON p.id = pc.post_id
WHERE p.created_at > NOW() - INTERVAL '7 days'
GROUP BY p.id, p.content, p.author_id, p.college_id, p.created_at;

-- Refresh Functions
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_college_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_activity;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trending_posts;
END;
$$ LANGUAGE plpgsql;

-- Create indexes on materialized views
CREATE UNIQUE INDEX idx_mv_college_stats_id ON mv_college_stats(id);
CREATE UNIQUE INDEX idx_mv_user_activity_id ON mv_user_activity(user_id);
CREATE UNIQUE INDEX idx_mv_trending_posts_id ON mv_trending_posts(id);
CREATE INDEX idx_mv_trending_posts_score ON mv_trending_posts(engagement_score DESC);

-- Comments
COMMENT ON MATERIALIZED VIEW mv_college_stats IS 'Aggregated statistics for colleges including reviews, posts, and mentors';
COMMENT ON MATERIALIZED VIEW mv_user_activity IS 'User activity summary including posts, interactions, and relationships';
COMMENT ON MATERIALIZED VIEW mv_trending_posts IS 'Trending posts based on recent engagement metrics'; 