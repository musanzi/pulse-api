import { IsArray, IsOptional, IsString } from 'class-validator';

export class AgritechDomainDetailsDto {
  @IsString()
  @IsOptional()
  agribusinessExperience?: string;

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
