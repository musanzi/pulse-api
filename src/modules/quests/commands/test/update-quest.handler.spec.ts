import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Quest } from '../../entities/quest.entity';
import { QuestStatus } from '../../enums';
import { UpdateQuestCommand } from '../impl';
import { UpdateQuestHandler } from '../handlers/update-quest.handler';

describe('UpdateQuestHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Quest>, 'merge' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: UpdateQuestHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'quest-id';
  const dto = { status: QuestStatus.OPEN };
  const quest = { id, title: 'Build a fintech API', status: QuestStatus.DRAFT } as Quest;
  const merged = { ...quest, status: QuestStatus.OPEN } as Quest;

  beforeEach(() => {
    repository = {
      merge: jest.fn(),
      save: jest.fn()
    };
    queryBus = { execute: jest.fn() };
    handler = new UpdateQuestHandler(mockDependency<Repository<Quest>>(repository), mockDependency<QueryBus>(queryBus));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('updates an existing quest', async () => {
    queryBus.execute.mockResolvedValueOnce(quest);
    repository.merge.mockReturnValueOnce(merged);
    repository.save.mockResolvedValueOnce(merged);

    const result = await handler.execute(new UpdateQuestCommand(id, dto));

    expect(result).toBe(merged);
    expect(repository.merge).toHaveBeenCalledWith(quest, dto);
    expect(repository.save).toHaveBeenCalledWith(merged);
  });

  it('throws NotFoundException unchanged when the quest does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Quête introuvable'));
    const promise = handler.execute(new UpdateQuestCommand(id, dto));

    await expect(promise).rejects.toThrow(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when the update fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce(quest);
    repository.merge.mockReturnValueOnce(merged);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new UpdateQuestCommand(id, dto));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Mise à jour de la quête impossible');
  });
});
