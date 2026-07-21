import { Query } from '@nestjs/cqrs';
import { Organisation } from '../../entities/organisation.entity';
import { IFilterOrganisations } from '../../interfaces';

export class FindOrganisationsQuery extends Query<[Organisation[], number]> {
  constructor(public readonly params: IFilterOrganisations = {}) {
    super();
  }
}
