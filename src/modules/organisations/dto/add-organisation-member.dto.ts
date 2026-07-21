import { IsEnum, IsUUID } from 'class-validator';
import { OrgMemberRole } from '../enums';

export class AddOrganisationMemberDto {
  @IsUUID()
  userId: string;

  @IsEnum(OrgMemberRole)
  memberRole: OrgMemberRole;
}
