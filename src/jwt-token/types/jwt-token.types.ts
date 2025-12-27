export interface JwtPayload {
  email: string;
  sub: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}