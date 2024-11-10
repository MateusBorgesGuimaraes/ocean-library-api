import { IsNumber } from 'class-validator';

export class RegisterEventDto {
  @IsNumber()
  userId: number;
}
