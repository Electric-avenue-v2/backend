import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { JwtPayload } from '~/auth/types/jwt-token.types';

interface GqlContext {
	req: {
		user: JwtPayload;
	};
}
export const GetCurrentUserId = createParamDecorator(
	(_: undefined, context: ExecutionContext): string => {
		const ctx = GqlExecutionContext.create(context);
		const gqlReq = ctx.getContext<GqlContext>().req;

		return gqlReq.user.sub;
	}
);
