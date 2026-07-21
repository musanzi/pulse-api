import { Provider } from '@nestjs/common';
import { RankQuestApplicantsHandler } from './rank-quest-applicants.handler';
import { GenerateRecommendationsHandler } from './generate-recommendations.handler';
import { UpdateRecommendationStatusHandler } from './update-recommendation-status.handler';
import { CompleteLearningStepHandler } from './complete-learning-step.handler';
import { SubmitRecommendationFeedbackHandler } from './submit-recommendation-feedback.handler';

export const CommandHandlers: Provider[] = [
  RankQuestApplicantsHandler,
  GenerateRecommendationsHandler,
  UpdateRecommendationStatusHandler,
  CompleteLearningStepHandler,
  SubmitRecommendationFeedbackHandler
];
