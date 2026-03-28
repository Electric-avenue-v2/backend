import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { JwtPayloadWithRt } from '~/auth/types/jwt-token.types';

interface GqlContext {
	req: {
		user: JwtPayloadWithRt;
	};
}

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
	const ctx = GqlExecutionContext.create(context);
	return ctx.getContext<GqlContext>().req.user;
});
