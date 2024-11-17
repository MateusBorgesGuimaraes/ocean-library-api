import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_TOKEN_PAYLOAD_KEY, ROUTE_POLICY_KEY } from '../auth.constants';
import { RoutePolicies } from '../enum/route-policies.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RoutePolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const routePoliciesRequired = this.reflector.get<
      RoutePolicies[] | undefined
    >(ROUTE_POLICY_KEY, context.getHandler());

    if (!routePoliciesRequired || routePoliciesRequired.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tokenPayload = request[REQUEST_TOKEN_PAYLOAD_KEY];

    if (!tokenPayload) {
      throw new UnauthorizedException(
        `Route requires one of these permissions: ${routePoliciesRequired.join(', ')}.`,
      );
    }

    const { user }: { user: User } = tokenPayload;

    const hasRequiredPermission = routePoliciesRequired.some((policy) =>
      user.permitions.includes(policy),
    );

    if (!hasRequiredPermission) {
      throw new UnauthorizedException(
        `Route requires one of these permissions: ${routePoliciesRequired.join(', ')}.`,
      );
    }

    return true;
  }
}
