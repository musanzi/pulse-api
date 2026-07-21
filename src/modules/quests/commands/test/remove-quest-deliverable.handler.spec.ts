import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { QuestDeliverable } from '../../entities/quest-deliverable.entity';
import { RemoveQuestDeliverableCommand } from '../impl';
import { RemoveQuestDeliverableHandler } from '../handlers/remove-quest-deliverable.handler';

describe('RemoveQuestDeliverableHandler', () => {
  let repository: jest.Mocked<Pick<Repository<QuestDeliverable>, 'findOne' | 'delete'>>;
  let handler: RemoveQuestDeliverableHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const questId = 'quest-id';
  const deliverableId = 'deliverable-id';
  const deliverable = { id: deliverableId, questId } as QuestDeliverable;

  beforeEach(() => {
    repository = { findOne: jest.fn(), delete: jest.fn() };
    handler = new RemoveQuestDeliverableHandler(mockDependency<Repository<QuestDeliverable>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('removes a deliverable that belongs to the quest', async () => {
    repository.findOne.mockResolvedValueOnce(deliverable);
    repository.delete.mockResolvedValueOnce({ affected: 1, raw: [] } as DeleteResult);

    await handler.execute(new RemoveQuestDeliverableCommand(questId, deliverableId));

    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: deliverableId, questId } });
    expect(repository.delete).toHaveBeenCalledWith(deliverableId);
  });

  it('throws NotFoundException when the deliverable does not exist on the quest', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    const promise = handler.execute(new RemoveQuestDeliverableCommand(questId, deliverableId));

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Livrable introuvable');
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when the deletion fails unexpectedly', async () => {
    repository.findOne.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new RemoveQuestDeliverableCommand(questId, deliverableId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Suppression du livrable impossible');
  });
});
