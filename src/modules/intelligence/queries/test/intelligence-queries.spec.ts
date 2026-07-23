import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Match } from '../../entities/match.entity';
import { Recommendation } from '../../entities/recommendation.entity';
import { FindQuestMatchesQuery, FindRecommendationByIdQuery, FindUserRecommendationsQuery } from '../impl';
import { FindQuestMatchesHandler } from '../handlers/find-quest-matches.handler';
import { FindRecommendationByIdHandler } from '../handlers/find-recommendation-by-id.handler';
import { FindUserRecommendationsHandler } from '../handlers/find-user-recommendations.handler';

describe('Intelligence query handlers', () => {
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  describe('FindUserRecommendationsHandler', () => {
    let repository: jest.Mocked<Pick<Repository<Recommendation>, 'find'>>;
    let handler: FindUserRecommendationsHandler;
    const recommendations = [{ id: 'rec-1' }] as Recommendation[];

    beforeEach(() => {
      repository = { find: jest.fn() };
      handler = new FindUserRecommendationsHandler(mockDependency<Repository<Recommendation>>(repository));
    });

    it('returns the talent recommendations with their steps, newest first', async () => {
      repository.find.mockResolvedValueOnce(recommendations);

      const result = await handler.execute(new FindUserRecommendationsQuery('user-id'));

      expect(result).toBe(recommendations);
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        relations: { steps: true },
        order: { createdAt: 'DESC' }
      });
    });

    it('throws BadRequestException when the lookup fails', async () => {
      repository.find.mockRejectedValueOnce(new Error('database unavailable'));

      await expect(handler.execute(new FindUserRecommendationsQuery('user-id'))).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('FindQuestMatchesHandler', () => {
    let repository: jest.Mocked<Pick<Repository<Match>, 'find'>>;
    let handler: FindQuestMatchesHandler;
    const matches = [{ id: 'match-1' }] as Match[];

    beforeEach(() => {
      repository = { find: jest.fn() };
      handler = new FindQuestMatchesHandler(mockDependency<Repository<Match>>(repository));
    });

    it('returns the quest matches ordered by score', async () => {
      repository.find.mockResolvedValueOnce(matches);

      const result = await handler.execute(new FindQuestMatchesQuery('quest-id'));

      expect(result).toBe(matches);
      expect(repository.find).toHaveBeenCalledWith({
        where: { questId: 'quest-id' },
        order: { score: 'DESC' }
      });
    });

    it('throws BadRequestException when the lookup fails', async () => {
      repository.find.mockRejectedValueOnce(new Error('database unavailable'));

      await expect(handler.execute(new FindQuestMatchesQuery('quest-id'))).rejects.toThrow(BadRequestException);
    });
  });

  describe('FindRecommendationByIdHandler', () => {
    let repository: jest.Mocked<Pick<Repository<Recommendation>, 'findOneOrFail'>>;
    let handler: FindRecommendationByIdHandler;
    const recommendation = { id: 'rec-1' } as Recommendation;

    beforeEach(() => {
      repository = { findOneOrFail: jest.fn() };
      handler = new FindRecommendationByIdHandler(mockDependency<Repository<Recommendation>>(repository));
    });

    it('returns the recommendation with its steps', async () => {
      repository.findOneOrFail.mockResolvedValueOnce(recommendation);

      const result = await handler.execute(new FindRecommendationByIdQuery('rec-1'));

      expect(result).toBe(recommendation);
      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 'rec-1' },
        relations: { steps: true }
      });
    });

    it('throws NotFoundException when the recommendation does not exist', async () => {
      repository.findOneOrFail.mockRejectedValueOnce(new Error('not found'));

      const promise = handler.execute(new FindRecommendationByIdQuery('missing'));

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Recommandation introuvable');
    });
  });
});
