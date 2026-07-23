import { Query } from '@nestjs/cqrs';
import { Recommendation } from '../../entities/recommendation.entity';

export class FindUserRecommendationsQuery extends Query<Recommendation[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
