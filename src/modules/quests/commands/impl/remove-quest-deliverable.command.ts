import { Command } from '@nestjs/cqrs';

export class RemoveQuestDeliverableCommand extends Command<void> {
  constructor(
    public readonly questId: string,
    public readonly deliverableId: string
  ) {
    super();
  }
}
