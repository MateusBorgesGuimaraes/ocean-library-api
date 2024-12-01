import { PartialType } from '@nestjs/mapped-types';
import { CreateEditorChoiceDto } from './create-editor-choice.dto';

export class UpdateEditorChoiceDto extends PartialType(CreateEditorChoiceDto) {}
