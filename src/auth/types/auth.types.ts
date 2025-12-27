import { Request } from 'express';

export interface IRequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
    accessToken?: string;
  } & Record<string, string | undefined>;
}
