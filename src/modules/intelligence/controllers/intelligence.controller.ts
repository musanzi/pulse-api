import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, Roles } from '@/modules/auth/decorators';
import { RoleEnum } from '@/modules/auth/enums';
import { CreateRecommendationFeedbackDto } from '../dto/create-recommendation-feedback.dto';
import { UpdateRecommendationStatusDto } from '../dto/update-recommendation-status.dto';
import { LearningPathStep } from '../entities/learning-path-step.entity';
import { Match } from '../entities/match.entity';
import { RecommendationFeedback } from '../entities/recommendation-feedback.entity';
import { Recommendation } from '../entities/recommendation.entity';
import {
  CompleteLearningStepCommand,
  GenerateRecommendationsCommand,
  RankQuestApplicantsCommand,
  SubmitRecommendationFeedbackCommand,
  UpdateRecommendationStatusCommand
} from '../commands';
import { FindQuestMatchesQuery, FindUserRecommendationsQuery } from '../queries';

// NOTE: applicant ranking is @Roles([ADMIN]) for now; widen to the quest's organisation
// members once the DigiPulse roles and OrgMemberGuard land.
@Controller('matching')
export class IntelligenceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // ----- Organisation-facing: rank the applicants for a quest -----

  @Post('quests/:questId/rank')
  @Roles([RoleEnum.ADMIN])
  rankApplicants(@Param('questId') questId: string): Promise<Match[]> {
    return this.commandBus.execute(new RankQuestApplicantsCommand(questId));
  }

  @Get('quests/:questId/matches')
  @Roles([RoleEnum.ADMIN])
  findMatches(@Param('questId') questId: string): Promise<Match[]> {
    return this.queryBus.execute(new FindQuestMatchesQuery(questId));
  }

  // ----- Talent-facing: personalised recommendations -----

  @Get('me/recommendations')
  findMyRecommendations(@CurrentUser('id') userId: string): Promise<Recommendation[]> {
    return this.queryBus.execute(new FindUserRecommendationsQuery(userId));
  }

  @Post('me/recommendations/generate')
  generateMyRecommendations(@CurrentUser('id') userId: string): Promise<Recommendation[]> {
    return this.commandBus.execute(new GenerateRecommendationsCommand(userId));
  }

  @Patch('recommendations/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRecommendationStatusDto,
    @CurrentUser('id') userId: string
  ): Promise<Recommendation> {
    return this.commandBus.execute(new UpdateRecommendationStatusCommand(id, dto, userId));
  }

  @Patch('learning-steps/:id/complete')
  completeStep(@Param('id') id: string, @CurrentUser('id') userId: string): Promise<LearningPathStep> {
    return this.commandBus.execute(new CompleteLearningStepCommand(id, userId));
  }

  @Post('recommendations/:id/feedback')
  submitFeedback(
    @Param('id') id: string,
    @Body() dto: CreateRecommendationFeedbackDto,
    @CurrentUser('id') userId: string
  ): Promise<RecommendationFeedback> {
    return this.commandBus.execute(new SubmitRecommendationFeedbackCommand(id, dto, userId));
  }
}
