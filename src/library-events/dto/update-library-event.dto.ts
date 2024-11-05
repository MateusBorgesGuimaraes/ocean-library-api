import { PartialType } from '@nestjs/mapped-types';
import { CreateLibraryEventDto } from './create-library-event.dto';

export class UpdateLibraryEventDto extends PartialType(CreateLibraryEventDto) {}
