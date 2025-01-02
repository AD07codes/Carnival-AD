export interface UserProfile {
  id: string;
  username: string;
  game_id?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TournamentParticipation {
  id: string;
  tournament_id: string;
  user_id: string;
  payment_status: string;
  joined_at: string;
  tournaments: {
    title: string;
    start_time: string;
    status: string;
    prize_pool: number;
  };
}
