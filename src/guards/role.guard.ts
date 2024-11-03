import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from 'src/role/utility/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<RoleEnum>('role', context.getHandler());
    if (!requiredRole) return true
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.role) throw new ForbiddenException('Access denied: user not found or roles not defined');
    if (user.role !== requiredRole) throw new ForbiddenException('Access denied: insufficient permissions')

    return true;
  }
}
