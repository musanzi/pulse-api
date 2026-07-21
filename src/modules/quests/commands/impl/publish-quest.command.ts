import { Command } from '@nestjs/cqrs';
import { Quest } from '../../entities/quest.entity';

export class PublishQuestCommand extends Command<Quest> {
  constructor(public readonly id: string) {
    super();
  }
}
