import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SkillLevel } from '../enums';

export class CreateQuestSkillDto {
  @IsUUID()
  skillId: string;

  @IsEnum(SkillLevel)
  @IsOptional()
  requiredLevel?: SkillLevel;
}
