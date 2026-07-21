import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationFeedback } from '../../entities/recommendation-feedback.entity';
import { Recommendation } from '../../entities/recommendation.entity';
import { FindRecommendationByIdQuery } from '../../queries';
import { SubmitRecommendationFeedbackCommand } from '../impl';

@CommandHandler(SubmitRecommendationFeedbackCommand)
export class SubmitRecommendationFeedbackHandler
  implements ICommandHandler<SubmitRecommendationFeedbackCommand, RecommendationFeedback>
{
  private readonly logger = new Logger(SubmitRecommendationFeedbackHandler.name);

  constructor(
    @InjectRepository(RecommendationFeedback)
    private readonly repository: Repository<RecommendationFeedback>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: SubmitRecommendationFeedbackCommand): Promise<RecommendationFeedback> {
    const { recommendationId, dto, userId } = command;

    try {
      const recommendation: Recommendation = await this.queryBus.execute(
        new FindRecommendationByIdQuery(recommendationId)
      );

      if (recommendation.userId !== userId) {
        throw new ForbiddenException('Vous ne pouvez évaluer que vos propres recommandations');
      }

      return await this.repository.save(this.repository.create({ ...dto, recommendationId, userId }));
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;

      this.logger.error(
        `Submit recommendation feedback failed id="${recommendationId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Envoi de l'évaluation impossible");
    }
  }
}
