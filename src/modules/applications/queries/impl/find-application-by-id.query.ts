import { Query } from '@nestjs/cqrs';
import { Application } from '../../entities/application.entity';

export class FindApplicationByIdQuery extends Query<Application> {
  constructor(public readonly id: string) {
    super();
  }
}
