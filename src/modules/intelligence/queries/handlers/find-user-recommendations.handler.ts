import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from '../../entities/recommendation.entity';
import { FindUserRecommendationsQuery } from '../impl';

@QueryHandler(FindUserRecommendationsQuery)
export class FindUserRecommendationsHandler implements IQueryHandler<FindUserRecommendationsQuery, Recommendation[]> {
  private readonly logger = new Logger(FindUserRecommendationsHandler.name);

  constructor(
    @InjectRepository(Recommendation)
    private readonly repository: Repository<Recommendation>
  ) {}

  async execute(query: FindUserRecommendationsQuery): Promise<Recommendation[]> {
    try {
      return await this.repository.find({
        where: { userId: query.userId },
        relations: { steps: true },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(
        `Find user recommendations failed userId="${query.userId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Recommandations introuvables');
    }
  }
}
