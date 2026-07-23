import { Query } from '@nestjs/cqrs';
import { Match } from '../../entities/match.entity';

export class FindQuestMatchesQuery extends Query<Match[]> {
  constructor(public readonly questId: string) {
    super();
  }
}
