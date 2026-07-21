import { Query } from '@nestjs/cqrs';
import { OrganisationMember } from '../../entities/organisation-member.entity';

export class FindOrganisationMembersQuery extends Query<OrganisationMember[]> {
  constructor(public readonly organisationId: string) {
    super();
  }
}
