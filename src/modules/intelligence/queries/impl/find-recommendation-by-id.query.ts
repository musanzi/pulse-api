import { Query } from '@nestjs/cqrs';
import { Recommendation } from '../../entities/recommendation.entity';

export class FindRecommendationByIdQuery extends Query<Recommendation> {
  constructor(public readonly id: string) {
    super();
  }
}
