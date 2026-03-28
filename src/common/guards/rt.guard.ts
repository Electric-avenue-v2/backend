import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class RtGuard extends AuthGuard('jwt-refresh') {
	getRequest(context: ExecutionContext): Request {
		const ctx = GqlExecutionContext.create(context);
		const gqlContext = ctx.getContext<{ req: Request }>();
		return gqlContext.req;
	}
}
