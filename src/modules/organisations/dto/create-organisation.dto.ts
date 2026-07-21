import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateOrganisationDto {
  @IsString()
  @IsNotEmpty({ message: "Le nom de l'organisation est obligatoire" })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sector?: string;

  @IsUrl({ protocols: ['http', 'https'] })
  @IsOptional()
  websiteUrl?: string;

  @IsUrl({ protocols: ['http', 'https'] })
  @IsOptional()
  logoUrl?: string;
}
