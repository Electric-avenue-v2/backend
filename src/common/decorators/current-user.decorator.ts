import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphqlContext } from '~/infrastructure/graphql';

export const GetCurrentUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
	const ctx = GqlExecutionContext.create(context);
	return ctx.getContext<GraphqlContext>().req.user;
});
