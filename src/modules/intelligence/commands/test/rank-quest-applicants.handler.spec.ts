import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Application } from '@/modules/applications/entities/application.entity';
import { Quest } from '@/modules/quests/entities/quest.entity';
import { QuestDomain } from '@/modules/quests/enums';
import { Match } from '../../entities/match.entity';
import { OpenRouterService } from '../../services/openrouter.service';
import { RankQuestApplicantsCommand } from '../impl';
import { RankQuestApplicantsHandler } from '../handlers/rank-quest-applicants.handler';

describe('RankQuestApplicantsHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Match>, 'find' | 'create' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let openRouterService: jest.Mocked<Pick<OpenRouterService, 'completeJson'>> & { model: string };
  let handler: RankQuestApplicantsHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const questId = 'quest-id';
  const quest = { id: questId, title: 'Build an API', domain: QuestDomain.CODING, description: 'x' } as Quest;
  const applications = [{ userId: 'user-1' }, { userId: 'user-2' }] as Application[];

  beforeEach(() => {
    repository = { find: jest.fn(), create: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    openRouterService = { completeJson: jest.fn(), model: 'anthropic/claude-opus-4-8' };
    handler = new RankQuestApplicantsHandler(
      mockDependency<Repository<Match>>(repository),
      mockDependency<QueryBus>(queryBus),
      mockDependency<OpenRouterService>(openRouterService)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('scores each applicant and stores the score as a 0-1 value', async () => {
    queryBus.execute.mockResolvedValueOnce(quest).mockResolvedValueOnce([applications, 2]);
    openRouterService.completeJson.mockResolvedValueOnce({
      matches: [
        { userId: 'user-1', score: 80, reasoning: 'strong Python' },
        { userId: 'user-2', score: 40, reasoning: 'light experience' }
      ]
    });
    repository.find.mockResolvedValueOnce([]);
    repository.create.mockImplementation((value) => value as Match);
    repository.save.mockImplementation(async (value) => value as Match[]);

    const result = await handler.execute(new RankQuestApplicantsCommand(questId));

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      userId: 'user-1',
      questId,
      score: 0.8,
      explanation: 'strong Python',
      method: 'anthropic/claude-opus-4-8'
    });
  });

  it('ignores scores for candidates who did not apply', async () => {
    queryBus.execute.mockResolvedValueOnce(quest).mockResolvedValueOnce([applications, 2]);
    openRouterService.completeJson.mockResolvedValueOnce({
      matches: [
        { userId: 'user-1', score: 90, reasoning: 'ok' },
        { userId: 'hallucinated-user', score: 95, reasoning: 'not a real applicant' }
      ]
    });
    repository.find.mockResolvedValueOnce([]);
    repository.create.mockImplementation((value) => value as Match);
    repository.save.mockImplementation(async (value) => value as Match[]);

    const result = await handler.execute(new RankQuestApplicantsCommand(questId));

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('user-1');
  });

  it('clamps scores outside the 0-100 range', async () => {
    queryBus.execute.mockResolvedValueOnce(quest).mockResolvedValueOnce([[applications[0]], 1]);
    openRouterService.completeJson.mockResolvedValueOnce({
      matches: [{ userId: 'user-1', score: 150, reasoning: 'over the top' }]
    });
    repository.find.mockResolvedValueOnce([]);
    repository.create.mockImplementation((value) => value as Match);
    repository.save.mockImplementation(async (value) => value as Match[]);

    const result = await handler.execute(new RankQuestApplicantsCommand(questId));

    expect(result[0].score).toBe(1);
  });

  it('returns an empty list without calling the AI when there are no applicants', async () => {
    queryBus.execute.mockResolvedValueOnce(quest).mockResolvedValueOnce([[], 0]);

    const result = await handler.execute(new RankQuestApplicantsCommand(questId));

    expect(result).toEqual([]);
    expect(openRouterService.completeJson).not.toHaveBeenCalled();
  });

  it('throws NotFoundException unchanged when the quest does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Quête introuvable'));

    await expect(handler.execute(new RankQuestApplicantsCommand(questId))).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when persisting the scores fails', async () => {
    queryBus.execute.mockResolvedValueOnce(quest).mockResolvedValueOnce([applications, 2]);
    openRouterService.completeJson.mockResolvedValueOnce({
      matches: [{ userId: 'user-1', score: 50, reasoning: 'ok' }]
    });
    repository.find.mockResolvedValueOnce([]);
    repository.create.mockImplementation((value) => value as Match);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new RankQuestApplicantsCommand(questId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Classement des candidatures impossible');
  });
});
