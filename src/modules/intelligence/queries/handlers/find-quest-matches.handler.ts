import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../../entities/match.entity';
import { FindQuestMatchesQuery } from '../impl';

@QueryHandler(FindQuestMatchesQuery)
export class FindQuestMatchesHandler implements IQueryHandler<FindQuestMatchesQuery, Match[]> {
  private readonly logger = new Logger(FindQuestMatchesHandler.name);

  constructor(
    @InjectRepository(Match)
    private readonly repository: Repository<Match>
  ) {}

  async execute(query: FindQuestMatchesQuery): Promise<Match[]> {
    try {
      return await this.repository.find({
        where: { questId: query.questId },
        order: { score: 'DESC' }
      });
    } catch (error) {
      this.logger.error(
        `Find quest matches failed questId="${query.questId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Correspondances introuvables');
    }
  }
}
