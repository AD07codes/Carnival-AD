-- Enhance payment_settings table
ALTER TABLE payment_settings
ADD COLUMN min_amount INTEGER DEFAULT 0,
ADD COLUMN max_amount INTEGER DEFAULT 10000;

-- Add is_admin column to chat_messages
ALTER TABLE chat_messages
ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Create function to auto-set is_admin
CREATE OR REPLACE FUNCTION set_message_admin_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_admin := EXISTS (
    SELECT 1 FROM users
    WHERE users.id = NEW.user_id
    AND users.role = 'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for chat messages
CREATE TRIGGER set_message_admin_status_trigger
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_admin_status();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_tournament_id ON chat_messages(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_tournament_id ON payment_requests(tournament_id);

-- Update RLS policies for better security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to send messages without restrictions"
  ON chat_messages
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

CREATE POLICY "Allow participants to send messages"
  ON chat_messages
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournament_participants
      WHERE tournament_participants.tournament_id = chat_messages.tournament_id
      AND tournament_participants.user_id = auth.uid()
      AND tournament_participants.payment_status = 'completed'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournament_participants
      WHERE tournament_participants.tournament_id = chat_messages.tournament_id
      AND tournament_participants.user_id = auth.uid()
      AND tournament_participants.payment_status = 'completed'
    )
  );

-- Add cascade delete triggers
CREATE OR REPLACE FUNCTION delete_tournament_cascade()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM chat_messages WHERE tournament_id = OLD.id;
  DELETE FROM tournament_participants WHERE tournament_id = OLD.id;
  DELETE FROM tournament_requests WHERE tournament_id = OLD.id;
  DELETE FROM tournament_rooms WHERE tournament_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_tournament_cascade_trigger
  BEFORE DELETE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION delete_tournament_cascade();
