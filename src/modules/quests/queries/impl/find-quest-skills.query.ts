import { Query } from '@nestjs/cqrs';
import { QuestSkill } from '../../entities/quest-skill.entity';

export class FindQuestSkillsQuery extends Query<QuestSkill[]> {
  constructor(public readonly questId: string) {
    super();
  }
}
