-- Messaging System Enhancement
CREATE TYPE message_status AS ENUM (
    'sent',
    'delivered',
    'read',
    'deleted'
);

-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS conversations;

-- Conversations/Chats
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES profiles(id),
    title TEXT,
    is_group BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Participants
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_admin BOOLEAN DEFAULT false,
    UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    content TEXT,
    attachments JSONB DEFAULT '[]',
    status message_status DEFAULT 'sent',
    reply_to UUID REFERENCES messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their conversations"
    ON conversations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations"
    ON conversations
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view messages in their conversations"
    ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations"
    ON messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join conversations they're invited to"
    ON conversation_participants
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view conversation participants"
    ON conversation_participants
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
            AND cp.user_id = auth.uid()
        )
    ); 