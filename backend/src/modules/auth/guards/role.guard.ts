import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import RequestWithUser from './request-with-user.interface';
import { UserRole } from '../../user/entities/user.role';

const RoleGuard = (
  roles: UserRole[],
  apiKeyAvailable = false,
): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthGuard {
    async canActivate(context: ExecutionContext) {
      if (apiKeyAvailable) {
        const apiKey = context.switchToHttp().getRequest().header('X-API-KEY');
        if (process.env.API_KEY === apiKey) {
          return true;
        }
      }

      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      if (user == null) {
        return false;
      }

      const user_role = user.role;
      for (const role of roles) {
        if (user_role === role.valueOf()) {
          return true;
        }
      }
      return false;
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
