import { CanActivate, ExecutionContext } from '@nestjs/common';

export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.user_id;
    if (!userId) return false;

    const result = await Bun.sql`
      SELECT role
      FROM user_roles
      WHERE user_id = ${userId}
    `;

    return result.length > 0 && result[0].role === 'admin';
  }
}
