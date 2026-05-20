import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext): CurrentUserData | CurrentUserData[keyof CurrentUserData] => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  },
);
