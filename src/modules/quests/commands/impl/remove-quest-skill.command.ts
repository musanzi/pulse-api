import { Command } from '@nestjs/cqrs';

export class RemoveQuestSkillCommand extends Command<void> {
  constructor(
    public readonly questId: string,
    public readonly questSkillId: string
  ) {
    super();
  }
}
