import { IsArray, IsEnum, ArrayNotEmpty } from 'class-validator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';

export class UpdatePermissionsDto {
  @IsArray()
  @IsEnum(RoutePolicies, { each: true })
  @ArrayNotEmpty()
  permissions: RoutePolicies[];
}
