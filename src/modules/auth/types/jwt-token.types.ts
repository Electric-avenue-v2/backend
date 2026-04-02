import { UserRole } from '@prisma/client';

export interface JwtPayload {
	email: string;
	sub: string;
	role: UserRole;
}

export interface JwtPayloadWithRt extends JwtPayload {
	refreshToken: string;
}

export interface Tokens {
	accessToken: string;
	refreshToken: string;
}
