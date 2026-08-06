import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface CurrentUserInfo {
  id: string;
  email: string;
  rol: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserInfo => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: CurrentUserInfo }>();
    return request.user;
  },
);
