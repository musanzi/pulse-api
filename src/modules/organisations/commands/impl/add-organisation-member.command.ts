import { Command } from '@nestjs/cqrs';
import { AddOrganisationMemberDto } from '../../dto/add-organisation-member.dto';
import { OrganisationMember } from '../../entities/organisation-member.entity';

export class AddOrganisationMemberCommand extends Command<OrganisationMember> {
  constructor(
    public readonly organisationId: string,
    public readonly dto: AddOrganisationMemberDto
  ) {
    super();
  }
}
