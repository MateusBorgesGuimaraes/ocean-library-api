import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoutePolicyGuard } from './route-policy.guard';
import { AuthTokenGuard } from './auth-token.guard';

@Injectable()
export class AuthAndPolicyGuard implements CanActivate {
  constructor(
    private readonly authTokenGuard: AuthTokenGuard,
    private readonly routePolicyGuard: RoutePolicyGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthValid = await this.authTokenGuard.canActivate(context);

    if (!isAuthValid) {
      return false;
    }

    return this.routePolicyGuard.canActivate(context);
  }
}
