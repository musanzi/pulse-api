import { Query } from '@nestjs/cqrs';
import { QuestDeliverable } from '../../entities/quest-deliverable.entity';

export class FindQuestDeliverablesQuery extends Query<QuestDeliverable[]> {
  constructor(public readonly questId: string) {
    super();
  }
}
