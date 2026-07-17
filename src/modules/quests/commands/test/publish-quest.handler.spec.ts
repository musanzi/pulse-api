import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Quest } from '../../entities/quest.entity';
import { QuestStatus } from '../../enums';
import { PublishQuestCommand } from '../impl';
import { PublishQuestHandler } from '../handlers/publish-quest.handler';

describe('PublishQuestHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Quest>, 'merge' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: PublishQuestHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'quest-id';
  const quest = { id, status: QuestStatus.DRAFT } as Quest;
  const published = { id, status: QuestStatus.OPEN } as Quest;

  beforeEach(() => {
    repository = { merge: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new PublishQuestHandler(mockDependency<Repository<Quest>>(repository), mockDependency<QueryBus>(queryBus));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('sets the quest status to OPEN', async () => {
    queryBus.execute.mockResolvedValueOnce(quest);
    repository.merge.mockReturnValueOnce(published);
    repository.save.mockResolvedValueOnce(published);

    const result = await handler.execute(new PublishQuestCommand(id));

    expect(result).toBe(published);
    expect(repository.merge).toHaveBeenCalledWith(quest, { status: QuestStatus.OPEN });
  });

  it('throws NotFoundException unchanged when the quest does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Quête introuvable'));
    const promise = handler.execute(new PublishQuestCommand(id));

    await expect(promise).rejects.toThrow(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when publishing fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce(quest);
    repository.merge.mockReturnValueOnce(published);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new PublishQuestCommand(id));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Publication de la quête impossible');
  });
});
