import { BadRequestException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { QuestDeliverable } from '../../entities/quest-deliverable.entity';
import { FindQuestDeliverablesQuery } from '../impl';
import { FindQuestDeliverablesHandler } from '../handlers/find-quest-deliverables.handler';

describe('FindQuestDeliverablesHandler', () => {
  let repository: jest.Mocked<Pick<Repository<QuestDeliverable>, 'find'>>;
  let handler: FindQuestDeliverablesHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const questId = 'quest-id';
  const deliverables = [{ id: 'deliverable-id', questId }] as QuestDeliverable[];

  beforeEach(() => {
    repository = { find: jest.fn() };
    handler = new FindQuestDeliverablesHandler(mockDependency<Repository<QuestDeliverable>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns the deliverables for a quest ordered by creation', async () => {
    repository.find.mockResolvedValueOnce(deliverables);

    const result = await handler.execute(new FindQuestDeliverablesQuery(questId));

    expect(result).toBe(deliverables);
    expect(repository.find).toHaveBeenCalledWith({ where: { questId }, order: { createdAt: 'ASC' } });
  });

  it('throws BadRequestException when deliverables cannot be found', async () => {
    repository.find.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new FindQuestDeliverablesQuery(questId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Livrables introuvables');
  });
});
