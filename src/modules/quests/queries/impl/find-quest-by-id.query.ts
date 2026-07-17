import { Query } from '@nestjs/cqrs';
import { Quest } from '../../entities/quest.entity';

export class FindQuestByIdQuery extends Query<Quest> {
  constructor(public readonly id: string) {
    super();
  }
}
