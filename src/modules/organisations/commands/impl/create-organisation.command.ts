import { Command } from '@nestjs/cqrs';
import { CreateOrganisationDto } from '../../dto/create-organisation.dto';
import { Organisation } from '../../entities/organisation.entity';

export class CreateOrganisationCommand extends Command<Organisation> {
  constructor(
    public readonly dto: CreateOrganisationDto,
    public readonly ownerId: string
  ) {
    super();
  }
}
