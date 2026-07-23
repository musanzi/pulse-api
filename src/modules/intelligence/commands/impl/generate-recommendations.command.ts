import { Command } from '@nestjs/cqrs';
import { Recommendation } from '../../entities/recommendation.entity';

export class GenerateRecommendationsCommand extends Command<Recommendation[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
