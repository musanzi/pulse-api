import { Command } from '@nestjs/cqrs';
import { CreateQuestSkillDto } from '../../dto/create-quest-skill.dto';
import { QuestSkill } from '../../entities/quest-skill.entity';

export class AddQuestSkillCommand extends Command<QuestSkill> {
  constructor(
    public readonly questId: string,
    public readonly dto: CreateQuestSkillDto
  ) {
    super();
  }
}
