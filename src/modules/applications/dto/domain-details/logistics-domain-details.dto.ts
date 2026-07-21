import { IsArray, IsOptional, IsString } from 'class-validator';

export class LogisticsDomainDetailsDto {
  @IsString()
  @IsOptional()
  logisticsExperience?: string;

  @IsString()
  @IsOptional()
  relevantProjects?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  softwareSkills?: string[];
}
