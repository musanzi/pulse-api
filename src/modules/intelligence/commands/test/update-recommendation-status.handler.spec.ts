import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Recommendation } from '../../entities/recommendation.entity';
import { RecommendationStatus } from '../../enums';
import { UpdateRecommendationStatusCommand } from '../impl';
import { UpdateRecommendationStatusHandler } from '../handlers/update-recommendation-status.handler';

describe('UpdateRecommendationStatusHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Recommendation>, 'merge' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: UpdateRecommendationStatusHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'rec-id';
  const userId = 'user-id';
  const dto = { status: RecommendationStatus.ACCEPTED };
  const recommendation = { id, userId, status: RecommendationStatus.SUGGESTED } as Recommendation;
  const accepted = { ...recommendation, status: RecommendationStatus.ACCEPTED } as Recommendation;

  beforeEach(() => {
    repository = { merge: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new UpdateRecommendationStatusHandler(
      mockDependency<Repository<Recommendation>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('updates the status of the owner own recommendation', async () => {
    queryBus.execute.mockResolvedValueOnce(recommendation);
    repository.merge.mockReturnValueOnce(accepted);
    repository.save.mockResolvedValueOnce(accepted);

    const result = await handler.execute(new UpdateRecommendationStatusCommand(id, dto, userId));

    expect(result).toBe(accepted);
    expect(repository.merge).toHaveBeenCalledWith(recommendation, { status: RecommendationStatus.ACCEPTED });
  });

  it('throws ForbiddenException when the recommendation belongs to someone else', async () => {
    queryBus.execute.mockResolvedValueOnce({ ...recommendation, userId: 'another-user' } as Recommendation);

    const promise = handler.execute(new UpdateRecommendationStatusCommand(id, dto, userId));

    await expect(promise).rejects.toThrow(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException unchanged when the recommendation does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Recommandation introuvable'));

    await expect(handler.execute(new UpdateRecommendationStatusCommand(id, dto, userId))).rejects.toThrow(
      NotFoundException
    );
  });

  it('throws BadRequestException when saving fails', async () => {
    queryBus.execute.mockResolvedValueOnce(recommendation);
    repository.merge.mockReturnValueOnce(accepted);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new UpdateRecommendationStatusCommand(id, dto, userId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Mise à jour de la recommandation impossible');
  });
});
