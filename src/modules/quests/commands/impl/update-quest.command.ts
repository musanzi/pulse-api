import { Command } from '@nestjs/cqrs';
import { UpdateQuestDto } from '../../dto/update-quest.dto';
import { Quest } from '../../entities/quest.entity';

export class UpdateQuestCommand extends Command<Quest> {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateQuestDto
  ) {
    super();
  }
}
