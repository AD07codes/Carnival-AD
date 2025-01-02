export interface AuthResponse {
  data: any | null;
  error: {
    message: string;
  } | null;
}

export interface UserCheckResponse {
  exists: boolean;
  error: string | null;
}
