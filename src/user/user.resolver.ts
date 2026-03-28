import { Query, Resolver } from '@nestjs/graphql';
import { GetCurrentUserId } from '~/common/decorators';
import { UserModel } from '~/user/models/user.model';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Query(() => UserModel, { name: 'me', nullable: true })
	async getMe(@GetCurrentUserId() userId: string): Promise<UserModel | null> {
		return this.userService.getMe(userId);
	}
}
