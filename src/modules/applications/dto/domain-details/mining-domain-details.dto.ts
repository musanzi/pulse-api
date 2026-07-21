import { IsArray, IsOptional, IsString } from 'class-validator';

export class MiningDomainDetailsDto {
  @IsString()
  @IsOptional()
  miningExperience?: string;

  @IsString()
  @IsOptional()
  relevantProjects?: string;

  @IsString()
  @IsOptional()
  fieldWorkExperience?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  softwareSkills?: string[];
}
