import { Command } from '@nestjs/cqrs';
import { CreateQuestDeliverableDto } from '../../dto/create-quest-deliverable.dto';
import { QuestDeliverable } from '../../entities/quest-deliverable.entity';

export class AddQuestDeliverableCommand extends Command<QuestDeliverable> {
  constructor(
    public readonly questId: string,
    public readonly dto: CreateQuestDeliverableDto
  ) {
    super();
  }
}
