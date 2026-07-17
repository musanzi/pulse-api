import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Quest } from '../../entities/quest.entity';
import { QuestDeliverable } from '../../entities/quest-deliverable.entity';
import { AddQuestDeliverableCommand } from '../impl';
import { AddQuestDeliverableHandler } from '../handlers/add-quest-deliverable.handler';

describe('AddQuestDeliverableHandler', () => {
  let repository: jest.Mocked<Pick<Repository<QuestDeliverable>, 'create' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: AddQuestDeliverableHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const questId = 'quest-id';
  const dto = { title: 'Submit a design doc', required: true };
  const deliverable = { id: 'deliverable-id', questId, ...dto } as QuestDeliverable;

  beforeEach(() => {
    repository = { create: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new AddQuestDeliverableHandler(
      mockDependency<Repository<QuestDeliverable>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('adds a deliverable to an existing quest', async () => {
    queryBus.execute.mockResolvedValueOnce({ id: questId } as Quest);
    repository.create.mockReturnValueOnce(deliverable);
    repository.save.mockResolvedValueOnce(deliverable);

    const result = await handler.execute(new AddQuestDeliverableCommand(questId, dto));

    expect(result).toBe(deliverable);
    expect(repository.create).toHaveBeenCalledWith({ ...dto, questId });
  });

  it('throws NotFoundException unchanged when the quest does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Quête introuvable'));
    const promise = handler.execute(new AddQuestDeliverableCommand(questId, dto));

    await expect(promise).rejects.toThrow(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when adding the deliverable fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce({ id: questId } as Quest);
    repository.create.mockReturnValueOnce(deliverable);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new AddQuestDeliverableCommand(questId, dto));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Ajout du livrable impossible');
  });
});
