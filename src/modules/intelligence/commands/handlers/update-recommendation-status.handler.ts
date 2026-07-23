import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from '../../entities/recommendation.entity';
import { FindRecommendationByIdQuery } from '../../queries';
import { UpdateRecommendationStatusCommand } from '../impl';

@CommandHandler(UpdateRecommendationStatusCommand)
export class UpdateRecommendationStatusHandler
  implements ICommandHandler<UpdateRecommendationStatusCommand, Recommendation>
{
  private readonly logger = new Logger(UpdateRecommendationStatusHandler.name);

  constructor(
    @InjectRepository(Recommendation)
    private readonly repository: Repository<Recommendation>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UpdateRecommendationStatusCommand): Promise<Recommendation> {
    const { id, dto, userId } = command;

    try {
      const recommendation: Recommendation = await this.queryBus.execute(new FindRecommendationByIdQuery(id));

      if (recommendation.userId !== userId) {
        throw new ForbiddenException('Vous ne pouvez modifier que vos propres recommandations');
      }

      return await this.repository.save(this.repository.merge(recommendation, { status: dto.status }));
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;

      this.logger.error(
        `Update recommendation status failed id="${id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Mise à jour de la recommandation impossible');
    }
  }
}
