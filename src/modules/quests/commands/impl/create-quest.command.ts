import { Command } from '@nestjs/cqrs';
import { CreateQuestDto } from '../../dto/create-quest.dto';
import { Quest } from '../../entities/quest.entity';

export class CreateQuestCommand extends Command<Quest> {
  constructor(public readonly dto: CreateQuestDto) {
    super();
  }
}
