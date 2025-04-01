import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero verificamos si el token es válido usando JwtAuthGuard
    const isAuthenticated = await super.canActivate(context);
    
    if (!isAuthenticated) {
      return false;
    }
    
    // Obtenemos los roles requeridos para la ruta
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si no hay roles requeridos, permitimos el acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    // Obtenemos el usuario autenticado del request
    const { user } = context.switchToHttp().getRequest();
    
    // Verificamos si el usuario tiene al menos uno de los roles requeridos
    return requiredRoles.includes(user.role);
  }
} 