import { Command } from '@nestjs/cqrs';

export class RemoveOrganisationMemberCommand extends Command<void> {
  constructor(
    public readonly organisationId: string,
    public readonly memberId: string
  ) {
    super();
  }
}
