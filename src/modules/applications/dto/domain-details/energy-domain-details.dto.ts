import { IsArray, IsOptional, IsString } from 'class-validator';

export class EnergyDomainDetailsDto {
  @IsString()
  @IsOptional()
  energyExperience?: string;

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
