import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/prisma/prisma.service';
import { UserModel } from '~/user/models/user.model';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	getMe(userId: string): Promise<UserModel | null> {
		return this.prisma.user.findUnique({
			where: { id: userId }
		});
	}
}
