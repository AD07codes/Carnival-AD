-- Create tournament rooms table
CREATE TABLE IF NOT EXISTS tournament_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  room_password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add team_name column to tournament_participants
ALTER TABLE tournament_participants
ADD COLUMN IF NOT EXISTS team_name TEXT;

-- Enable RLS
ALTER TABLE tournament_rooms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admins full access to tournament rooms"
  ON tournament_rooms
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Allow participants to view room details"
  ON tournament_rooms
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournament_participants
      WHERE tournament_participants.tournament_id = tournament_rooms.tournament_id
      AND tournament_participants.user_id = auth.uid()
      AND tournament_participants.payment_status = 'completed'
    )
  );
