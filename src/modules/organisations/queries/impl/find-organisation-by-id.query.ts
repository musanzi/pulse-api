import { Query } from '@nestjs/cqrs';
import { Organisation } from '../../entities/organisation.entity';

export class FindOrganisationByIdQuery extends Query<Organisation> {
  constructor(public readonly id: string) {
    super();
  }
}
