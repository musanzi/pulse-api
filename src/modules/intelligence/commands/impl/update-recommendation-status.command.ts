import { Command } from '@nestjs/cqrs';
import { UpdateRecommendationStatusDto } from '../../dto/update-recommendation-status.dto';
import { Recommendation } from '../../entities/recommendation.entity';

export class UpdateRecommendationStatusCommand extends Command<Recommendation> {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateRecommendationStatusDto,
    public readonly userId: string
  ) {
    super();
  }
}
