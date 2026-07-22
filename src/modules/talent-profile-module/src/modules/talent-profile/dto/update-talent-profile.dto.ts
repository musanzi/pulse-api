import { IsString, IsOptional, IsUrl, IsInt, Min, Max, MaxLength, IsPhoneNumber } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * UpdateTalentProfileDto — PATCH semantics, all fields optional.
 *
 * Fixes (from Week 1 audit):
 *   GN-013 / BUG-004 : portfolio/avatarUrl accepts javascript: → @IsUrl protocols allow-list
 *   GN-012           : phone accepts arbitrary strings         → @IsPhoneNumber
 *   GN-014           : availability accepts negatives          → @Min(0) @Max(80)
 */
export class UpdateTalentProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsPhoneNumber(null, { message: 'Phone must be a valid international phone number (e.g. +2348012345678)' })
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @IsUrl({ protocols: ['http', 'https'], require_tld: true }, { message: 'Avatar must be a valid http or https URL' })
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  educationSummary?: string;

  @IsInt({ message: 'Availability must be a whole number' })
  @Min(0, { message: 'Availability cannot be negative' })
  @Max(80, { message: 'Availability cannot exceed 80 hours per week' })
  @IsOptional()
  availability?: number;

  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  yearsExperience?: number;

  @IsUrl({ protocols: ['http', 'https'], require_tld: true }, { message: 'Portfolio must be a valid http or https URL' })
  @IsOptional()
  portfolio?: string;
}
