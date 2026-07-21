import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestDeliverable } from '../../entities/quest-deliverable.entity';
import { FindQuestDeliverablesQuery } from '../impl';

@QueryHandler(FindQuestDeliverablesQuery)
export class FindQuestDeliverablesHandler implements IQueryHandler<FindQuestDeliverablesQuery, QuestDeliverable[]> {
  private readonly logger = new Logger(FindQuestDeliverablesHandler.name);

  constructor(
    @InjectRepository(QuestDeliverable)
    private readonly repository: Repository<QuestDeliverable>
  ) {}

  async execute(query: FindQuestDeliverablesQuery): Promise<QuestDeliverable[]> {
    try {
      return await this.repository.find({
        where: { questId: query.questId },
        order: { createdAt: 'ASC' }
      });
    } catch (error) {
      this.logger.error(
        `Find quest deliverables failed questId="${query.questId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Livrables introuvables');
    }
  }
}
