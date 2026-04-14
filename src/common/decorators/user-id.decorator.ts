import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphqlContext } from '~/infrastructure/graphql';

export const GetCurrentUserId = createParamDecorator((_: undefined, context: ExecutionContext): string => {
	const ctx = GqlExecutionContext.create(context);
	const gqlReq = ctx.getContext<GraphqlContext>().req;
	const sub = gqlReq.user?.sub;

	if (!sub) throw new UnauthorizedException('User not authenticated');
	
	return sub;
});
