import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuestDeliverableDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre du livrable est obligatoire' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;
}
