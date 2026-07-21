import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { QuestDomain, QuestLevel, QuestStatus } from '../enums';

export class CreateQuestDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre de la quête est obligatoire' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'La description de la quête est obligatoire' })
  description: string;

  @IsEnum(QuestDomain)
  domain: QuestDomain;

  @IsEnum(QuestLevel)
  @IsOptional()
  level?: QuestLevel;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationDays?: number;

  @IsEnum(QuestStatus)
  @IsOptional()
  status?: QuestStatus;

  @IsUUID()
  organisationId: string;
}
