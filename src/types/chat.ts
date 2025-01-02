export interface ChatMessage {
  id: string;
  tournament_id: string;
  user_id: string;
  message: string;
  created_at: string;
  users?: {
    username: string;
  };
}
