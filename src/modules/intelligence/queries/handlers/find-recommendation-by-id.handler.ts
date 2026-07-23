import { Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from '../../entities/recommendation.entity';
import { FindRecommendationByIdQuery } from '../impl';

@QueryHandler(FindRecommendationByIdQuery)
export class FindRecommendationByIdHandler implements IQueryHandler<FindRecommendationByIdQuery, Recommendation> {
  private readonly logger = new Logger(FindRecommendationByIdHandler.name);

  constructor(
    @InjectRepository(Recommendation)
    private readonly repository: Repository<Recommendation>
  ) {}

  async execute(query: FindRecommendationByIdQuery): Promise<Recommendation> {
    try {
      return await this.repository.findOneOrFail({
        where: { id: query.id },
        relations: { steps: true }
      });
    } catch (error) {
      this.logger.error(
        `Find recommendation by id failed id="${query.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('Recommandation introuvable');
    }
  }
}
