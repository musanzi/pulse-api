import { Command } from '@nestjs/cqrs';
import { CreateRecommendationFeedbackDto } from '../../dto/create-recommendation-feedback.dto';
import { RecommendationFeedback } from '../../entities/recommendation-feedback.entity';

export class SubmitRecommendationFeedbackCommand extends Command<RecommendationFeedback> {
  constructor(
    public readonly recommendationId: string,
    public readonly dto: CreateRecommendationFeedbackDto,
    public readonly userId: string
  ) {
    super();
  }
}
