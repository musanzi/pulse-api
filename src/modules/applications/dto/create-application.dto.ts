import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  questId: string;

  @IsUUID()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  motivation?: string;

  // Shape depends on the quest's domain; validated in the handler once the quest is known.
  @IsObject()
  @IsOptional()
  domainDetails?: Record<string, unknown>;

  @IsUUID()
  @IsOptional()
  cvDocumentId?: string;
}
