import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '~/jwt-token/types/jwt-token.types';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return user.sub;
  },
);