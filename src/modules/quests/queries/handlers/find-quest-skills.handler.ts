import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestSkill } from '../../entities/quest-skill.entity';
import { FindQuestSkillsQuery } from '../impl';

@QueryHandler(FindQuestSkillsQuery)
export class FindQuestSkillsHandler implements IQueryHandler<FindQuestSkillsQuery, QuestSkill[]> {
  private readonly logger = new Logger(FindQuestSkillsHandler.name);

  constructor(
    @InjectRepository(QuestSkill)
    private readonly repository: Repository<QuestSkill>
  ) {}

  async execute(query: FindQuestSkillsQuery): Promise<QuestSkill[]> {
    try {
      return await this.repository.find({
        where: { questId: query.questId },
        order: { createdAt: 'ASC' }
      });
    } catch (error) {
      this.logger.error(
        `Find quest skills failed questId="${query.questId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Compétences introuvables');
    }
  }
}
