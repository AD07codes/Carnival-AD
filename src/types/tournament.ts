export interface Tournament {
  id: string;
  title: string;
  description: string;
  start_time: string;
  entry_fee: number;
  max_participants: number;
  prize_pool: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  rules: string;
  created_at: string;
  created_by: string;
}

export interface Participant {
  id: string;
  tournament_id: string;
  user_id: string;
  payment_status: string;
  joined_at: string;
  users: {
    username: string;
  };
}
