import { Command } from '@nestjs/cqrs';
import { Match } from '../../entities/match.entity';

export class RankQuestApplicantsCommand extends Command<Match[]> {
  constructor(public readonly questId: string) {
    super();
  }
}
