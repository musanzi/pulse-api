import { Query } from '@nestjs/cqrs';
import { Application } from '../../entities/application.entity';
import { IFilterApplications } from '../../interfaces';

export class FindApplicationsQuery extends Query<[Application[], number]> {
  constructor(public readonly params: IFilterApplications = {}) {
    super();
  }
}
