import { CreateRequestDto } from './create-request.dto';

export class RequestDto extends CreateRequestDto {
  id: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
