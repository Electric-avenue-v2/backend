export interface JwtPayload {
	email: string;
	sub: string;
}

export interface JwtPayloadWithRt extends JwtPayload {
	refreshToken: string;
}

export interface Tokens {
	accessToken: string;
	refreshToken: string;
}
