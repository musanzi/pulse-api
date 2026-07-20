import { IsArray, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class CodingDomainDetailsDto {
  @IsUrl({ protocols: ['http', 'https'] })
  @IsOptional()
  githubRepo?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  programmingLanguages?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  frameworks?: string[];

  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  yearsExperience?: number;

  @IsArray()
  @IsUrl({ protocols: ['http', 'https'] }, { each: true })
  @IsOptional()
  projectLinks?: string[];

  @IsString()
  @IsOptional()
  codeChallengeAnswer?: string;
}
