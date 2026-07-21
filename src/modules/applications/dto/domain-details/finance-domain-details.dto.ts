import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FinanceDomainDetailsDto {
  @IsString()
  @IsOptional()
  financeExperience?: string;

  @IsString()
  @IsOptional()
  caseStudyAnswer?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relevantCertifications?: string[];

  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  yearsInFinance?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  softwareSkills?: string[];
}
