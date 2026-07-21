import { BadRequestException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '@/modules/applications/entities/application.entity';
import { FindApplicationsQuery } from '@/modules/applications/queries';
import { Quest } from '@/modules/quests/entities/quest.entity';
import { QuestStatus } from '@/modules/quests/enums';
import { FindQuestsQuery } from '@/modules/quests/queries';
import { LearningPathStep } from '../../entities/learning-path-step.entity';
import { Recommendation } from '../../entities/recommendation.entity';
import { LearningStepType, RecommendationType } from '../../enums';
import { buildRecommendationPrompt, RECOMMENDATION_SYSTEM_PROMPT } from '../../helpers';
import { IAiRecommendationResponse } from '../../interfaces';
import { OpenRouterService } from '../../services/openrouter.service';
import { GenerateRecommendationsCommand } from '../impl';

@CommandHandler(GenerateRecommendationsCommand)
export class GenerateRecommendationsHandler
  implements ICommandHandler<GenerateRecommendationsCommand, Recommendation[]>
{
  private readonly logger = new Logger(GenerateRecommendationsHandler.name);

  constructor(
    @InjectRepository(Recommendation)
    private readonly repository: Repository<Recommendation>,
    @InjectRepository(LearningPathStep)
    private readonly stepRepository: Repository<LearningPathStep>,
    private readonly queryBus: QueryBus,
    private readonly openRouterService: OpenRouterService
  ) {}

  async execute(command: GenerateRecommendationsCommand): Promise<Recommendation[]> {
    const { userId } = command;

    try {
      const [quests]: [Quest[], number] = await this.queryBus.execute(
        new FindQuestsQuery({ status: QuestStatus.OPEN })
      );

      if (quests.length === 0) return [];

      const [applications]: [Application[], number] = await this.queryBus.execute(
        new FindApplicationsQuery({ userId })
      );

      const result = await this.openRouterService.completeJson<IAiRecommendationResponse>(
        RECOMMENDATION_SYSTEM_PROMPT,
        buildRecommendationPrompt(applications, quests)
      );

      const questIds = new Set(quests.map((quest) => quest.id));
      // Drop anything pointing at a quest that does not exist — the model can hallucinate ids.
      const suggestions = (result.recommendations ?? []).filter(
        (recommendation) => !recommendation.questId || questIds.has(recommendation.questId)
      );

      const saved: Recommendation[] = [];

      for (const suggestion of suggestions) {
        const steps = suggestion.steps ?? [];
        const recommendation = await this.repository.save(
          this.repository.create({
            userId,
            type: steps.length > 0 ? RecommendationType.LEARNING_PATH : RecommendationType.QUEST,
            questId: suggestion.questId,
            score: suggestion.score === undefined ? undefined : Math.min(Math.max(suggestion.score, 0), 100) / 100,
            reason: suggestion.reason,
            skillGaps: suggestion.skillGaps,
            modelVersion: this.openRouterService.model
          })
        );

        if (steps.length > 0) {
          await this.stepRepository.save(
            steps.map((step, index) =>
              this.stepRepository.create({
                recommendationId: recommendation.id,
                stepOrder: index + 1,
                type: this.toStepType(step.type),
                questId: step.questId && questIds.has(step.questId) ? step.questId : undefined,
                title: step.title,
                note: step.note
              })
            )
          );
        }

        saved.push(recommendation);
      }

      return saved;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;

      this.logger.error(
        `Generate recommendations failed userId="${userId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Génération des recommandations impossible');
    }
  }

  private toStepType(type?: string): LearningStepType {
    return type && type in LearningStepType ? LearningStepType[type as keyof typeof LearningStepType] : LearningStepType.RESOURCE;
  }
}
