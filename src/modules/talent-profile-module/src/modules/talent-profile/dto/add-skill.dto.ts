import { IsString, IsNotEmpty, MaxLength, MinLength, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Transform } from 'class-transformer';

/** Single skill — name is trimmed and lowercased by the Transform. */
export class AddSkillDto {
  @IsString()
  @IsNotEmpty({ message: 'Skill name cannot be empty' })
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  name: string;
}

/**
 * Batch — array of skill names sent together.
 * Fixes GN-010: frontend parses comma-separated input and POSTs the array.
 * Each entry is trimmed + lowercased; the handler de-duplicates against existing skills.
 */
export class AddSkillsBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((s: string) => (typeof s === 'string' ? s.trim().toLowerCase() : s)) : value
  )
  names: string[];
}
