import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntelligenceController } from './controllers/intelligence.controller';
import { Match } from './entities/match.entity';
import { Recommendation } from './entities/recommendation.entity';
import { LearningPathStep } from './entities/learning-path-step.entity';
import { RecommendationFeedback } from './entities/recommendation-feedback.entity';
import { OpenRouterService } from './services/openrouter.service';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Recommendation, LearningPathStep, RecommendationFeedback])],
  controllers: [IntelligenceController],
  providers: [OpenRouterService, ...CommandHandlers, ...QueryHandlers],
  exports: [OpenRouterService]
})
export class IntelligenceModule {}
