import { Command } from '@nestjs/cqrs';

export class DeleteQuestCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
