import { BadRequestException, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Application } from '@/modules/applications/entities/application.entity';
import { Quest } from '@/modules/quests/entities/quest.entity';
import { LearningPathStep } from '../../entities/learning-path-step.entity';
import { Recommendation } from '../../entities/recommendation.entity';
import { LearningStepType, RecommendationType } from '../../enums';
import { OpenRouterService } from '../../services/openrouter.service';
import { GenerateRecommendationsCommand } from '../impl';
import { GenerateRecommendationsHandler } from '../handlers/generate-recommendations.handler';

describe('GenerateRecommendationsHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Recommendation>, 'create' | 'save'>>;
  let stepRepository: jest.Mocked<Pick<Repository<LearningPathStep>, 'create' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let openRouterService: jest.Mocked<Pick<OpenRouterService, 'completeJson'>> & { model: string };
  let handler: GenerateRecommendationsHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const userId = 'user-id';
  const quests = [{ id: 'quest-1', title: 'Build an API' }] as Quest[];
  const applications = [{ userId, domainDetails: { programmingLanguages: ['Python'] } }] as unknown as Application[];

  beforeEach(() => {
    repository = { create: jest.fn(), save: jest.fn() };
    stepRepository = { create: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    openRouterService = { completeJson: jest.fn(), model: 'anthropic/claude-opus-4-8' };
    handler = new GenerateRecommendationsHandler(
      mockDependency<Repository<Recommendation>>(repository),
      mockDependency<Repository<LearningPathStep>>(stepRepository),
      mockDependency<QueryBus>(queryBus),
      mockDependency<OpenRouterService>(openRouterService)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('stores a LEARNING_PATH recommendation with its ordered steps', async () => {
    queryBus.execute.mockResolvedValueOnce([quests, 1]).mockResolvedValueOnce([applications, 1]);
    openRouterService.completeJson.mockResolvedValueOnce({
      recommendations: [
        {
          questId: 'quest-1',
          score: 70,
          reason: "You're one level short on Python",
          skillGaps: [{ skill: 'Python', current: 'ADVANCED', required: 'EXPERT' }],
          steps: [
            { title: 'Complete the SQL quest', type: 'QUEST', questId: 'quest-1' },
            { title: 'Strengthen your portfolio', type: 'SKILL' }
          ]
        }
      ]
    });
    repository.create.mockImplementation((value) => value as Recommendation);
    repository.save.mockImplementation(async (value) => ({ ...value, id: 'rec-1' }) as Recommendation);
    stepRepository.create.mockImplementation((value) => value as LearningPathStep);
    stepRepository.save.mockImplementation(async (value) => value as LearningPathStep[]);

    const result = await handler.execute(new GenerateRecommendationsCommand(userId));

    expect(result).toHaveLength(1);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        type: RecommendationType.LEARNING_PATH,
        questId: 'quest-1',
        score: 0.7,
        modelVersion: 'anthropic/claude-opus-4-8'
      })
    );
    expect(stepRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ stepOrder: 1, type: LearningStepType.QUEST, questId: 'quest-1' })
    );
    expect(stepRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ stepOrder: 2, type: LearningStepType.SKILL })
    );
  });

  it('stores a QUEST recommendation when the AI returns no steps', async () => {
    queryBus.execute.mockResolvedValueOnce([quests, 1]).mockResolvedValueOnce([applications, 1]);
    openRouterService.completeJson.mockResolvedValueOnce({
      recommendations: [{ questId: 'quest-1', reason: 'Good fit' }]
    });
    repository.create.mockImplementation((value) => value as Recommendation);
    repository.save.mockImplementation(async (value) => ({ ...value, id: 'rec-1' }) as Recommendation);

    await handler.execute(new GenerateRecommendationsCommand(userId));

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: RecommendationType.QUEST })
    );
    expect(stepRepository.save).not.toHaveBeenCalled();
  });

  it('drops recommendations pointing at a quest that does not exist', async () => {
    queryBus.execute.mockResolvedValueOnce([quests, 1]).mockResolvedValueOnce([applications, 1]);
    openRouterService.completeJson.mockResolvedValueOnce({
      recommendations: [{ questId: 'hallucinated-quest', reason: 'Not real' }]
    });

    const result = await handler.execute(new GenerateRecommendationsCommand(userId));

    expect(result).toEqual([]);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('returns an empty list without calling the AI when no quests are open', async () => {
    queryBus.execute.mockResolvedValueOnce([[], 0]);

    const result = await handler.execute(new GenerateRecommendationsCommand(userId));

    expect(result).toEqual([]);
    expect(openRouterService.completeJson).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when persisting fails', async () => {
    queryBus.execute.mockResolvedValueOnce([quests, 1]).mockResolvedValueOnce([applications, 1]);
    openRouterService.completeJson.mockResolvedValueOnce({
      recommendations: [{ questId: 'quest-1', reason: 'Good fit' }]
    });
    repository.create.mockImplementation((value) => value as Recommendation);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new GenerateRecommendationsCommand(userId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Génération des recommandations impossible');
  });
});
