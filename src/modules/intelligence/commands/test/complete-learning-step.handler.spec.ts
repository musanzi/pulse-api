import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { LearningPathStep } from '../../entities/learning-path-step.entity';
import { CompleteLearningStepCommand } from '../impl';
import { CompleteLearningStepHandler } from '../handlers/complete-learning-step.handler';

describe('CompleteLearningStepHandler', () => {
  let repository: jest.Mocked<Pick<Repository<LearningPathStep>, 'findOne' | 'merge' | 'save'>>;
  let handler: CompleteLearningStepHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'step-id';
  const userId = 'user-id';
  const step = { id, isCompleted: false, recommendation: { userId } } as LearningPathStep;
  const completed = { ...step, isCompleted: true } as LearningPathStep;

  beforeEach(() => {
    repository = { findOne: jest.fn(), merge: jest.fn(), save: jest.fn() };
    handler = new CompleteLearningStepHandler(mockDependency<Repository<LearningPathStep>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('marks the step complete for its owner', async () => {
    repository.findOne.mockResolvedValueOnce(step);
    repository.merge.mockReturnValueOnce(completed);
    repository.save.mockResolvedValueOnce(completed);

    const result = await handler.execute(new CompleteLearningStepCommand(id, userId));

    expect(result).toBe(completed);
    expect(repository.merge).toHaveBeenCalledWith(step, { isCompleted: true });
  });

  it('throws NotFoundException when the step does not exist', async () => {
    repository.findOne.mockResolvedValueOnce(null);

    const promise = handler.execute(new CompleteLearningStepCommand(id, userId));

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Étape introuvable');
  });

  it('throws ForbiddenException when the step belongs to another talent', async () => {
    repository.findOne.mockResolvedValueOnce({
      ...step,
      recommendation: { userId: 'another-user' }
    } as LearningPathStep);

    const promise = handler.execute(new CompleteLearningStepCommand(id, userId));

    await expect(promise).rejects.toThrow(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when saving fails', async () => {
    repository.findOne.mockResolvedValueOnce(step);
    repository.merge.mockReturnValueOnce(completed);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new CompleteLearningStepCommand(id, userId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow("Validation de l'étape impossible");
  });
});
