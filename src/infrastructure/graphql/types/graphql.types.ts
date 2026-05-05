import { UserRole } from '@prisma/client';

export interface GraphqlContext {
	req: Request & {
		user?: {
			email: string;
			sub: string;
			role: UserRole;
		};
	};
	res: Response;
}
