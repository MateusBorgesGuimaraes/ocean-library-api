import { SetMetadata } from '@nestjs/common';
import { ROUTE_POLICY_KEY } from '../auth.constants';
import { RoutePolicies } from '../enum/route-policies.enum';

export const SetRoutePolicy = (...policies: RoutePolicies[]) => {
  return SetMetadata(ROUTE_POLICY_KEY, policies);
};
