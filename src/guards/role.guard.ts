import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EligbleInviteRole, RoleEnum } from 'src/modules/role/utility/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<RoleEnum[]>('role', [
      context.getHandler(),
      context.getClass()
    ]);
    if (!requiredRole) return true
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.role) throw new ForbiddenException({
      statusCode: 401,
      message: 'Access denied: user or role not found',
      data: null,
      cached: false,
      timestamp: new Date().toISOString(),
    });
    // if (user.role !== requiredRole) 
    // throw new ForbiddenException({
    //   statusCode: 401,
    //   message: 'Access denied: insufficient permissions',
    //   data: null,
    //   cached: false,
    //   timestamp: new Date().toISOString(),
    // });

    return requiredRole.some((role) => user?.roles?.includes(role));
  }
}
