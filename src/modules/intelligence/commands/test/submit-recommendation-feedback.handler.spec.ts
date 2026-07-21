import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { RecommendationFeedback } from '../../entities/recommendation-feedback.entity';
import { Recommendation } from '../../entities/recommendation.entity';
import { FeedbackType } from '../../enums';
import { SubmitRecommendationFeedbackCommand } from '../impl';
import { SubmitRecommendationFeedbackHandler } from '../handlers/submit-recommendation-feedback.handler';

describe('SubmitRecommendationFeedbackHandler', () => {
  let repository: jest.Mocked<Pick<Repository<RecommendationFeedback>, 'create' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: SubmitRecommendationFeedbackHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const recommendationId = 'rec-id';
  const userId = 'user-id';
  const dto = { feedbackType: FeedbackType.HELPFUL, comment: 'Did the project, learned a lot' };
  const recommendation = { id: recommendationId, userId } as Recommendation;
  const feedback = { id: 'feedback-id' } as RecommendationFeedback;

  beforeEach(() => {
    repository = { create: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new SubmitRecommendationFeedbackHandler(
      mockDependency<Repository<RecommendationFeedback>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('records feedback against the talent own recommendation', async () => {
    queryBus.execute.mockResolvedValueOnce(recommendation);
    repository.create.mockReturnValueOnce(feedback);
    repository.save.mockResolvedValueOnce(feedback);

    const result = await handler.execute(new SubmitRecommendationFeedbackCommand(recommendationId, dto, userId));

    expect(result).toBe(feedback);
    expect(repository.create).toHaveBeenCalledWith({ ...dto, recommendationId, userId });
  });

  it('throws ForbiddenException when rating someone else recommendation', async () => {
    queryBus.execute.mockResolvedValueOnce({ ...recommendation, userId: 'another-user' } as Recommendation);

    const promise = handler.execute(new SubmitRecommendationFeedbackCommand(recommendationId, dto, userId));

    await expect(promise).rejects.toThrow(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException unchanged when the recommendation does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Recommandation introuvable'));

    await expect(
      handler.execute(new SubmitRecommendationFeedbackCommand(recommendationId, dto, userId))
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when saving fails', async () => {
    queryBus.execute.mockResolvedValueOnce(recommendation);
    repository.create.mockReturnValueOnce(feedback);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new SubmitRecommendationFeedbackCommand(recommendationId, dto, userId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow("Envoi de l'évaluation impossible");
  });
});
