import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

interface GqlContext {
	req: Request;
}

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
			context.getHandler(),
			context.getClass()
		]);

		if (!requiredRoles || requiredRoles.length === 0) {
			return true;
		}

		const ctx = GqlExecutionContext.create(context);
		const gqlContext = ctx.getContext<GqlContext>();

		const user = gqlContext.req.user;

		if (!user) {
			throw new ForbiddenException('User not found in request');
		}

		if (!requiredRoles.includes(user.role)) {
			throw new ForbiddenException(`Access denied for role ${user.role.toLowerCase()}`);
		}

		return true;
	}
}
