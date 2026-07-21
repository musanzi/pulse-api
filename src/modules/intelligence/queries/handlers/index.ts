import { Provider } from '@nestjs/common';
import { FindUserRecommendationsHandler } from './find-user-recommendations.handler';
import { FindQuestMatchesHandler } from './find-quest-matches.handler';
import { FindRecommendationByIdHandler } from './find-recommendation-by-id.handler';

export const QueryHandlers: Provider[] = [
  FindUserRecommendationsHandler,
  FindQuestMatchesHandler,
  FindRecommendationByIdHandler
];
