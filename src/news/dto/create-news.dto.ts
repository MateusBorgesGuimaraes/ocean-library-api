import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  conteudo: string;

  // imagemCapa: string;

  @IsArray()
  @IsNotEmpty()
  tags: string[];
}
