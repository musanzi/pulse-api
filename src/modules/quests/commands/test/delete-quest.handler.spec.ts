import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { DeleteResult, Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Quest } from '../../entities/quest.entity';
import { DeleteQuestCommand } from '../impl';
import { DeleteQuestHandler } from '../handlers/delete-quest.handler';

describe('DeleteQuestHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Quest>, 'delete'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: DeleteQuestHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'quest-id';
  const quest = { id, title: 'Build a fintech API' } as Quest;

  beforeEach(() => {
    repository = {
      delete: jest.fn()
    };
    queryBus = { execute: jest.fn() };
    handler = new DeleteQuestHandler(mockDependency<Repository<Quest>>(repository), mockDependency<QueryBus>(queryBus));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('deletes an existing quest', async () => {
    queryBus.execute.mockResolvedValueOnce(quest);
    repository.delete.mockResolvedValueOnce({ affected: 1, raw: [] } as DeleteResult);

    await handler.execute(new DeleteQuestCommand(id));

    expect(repository.delete).toHaveBeenCalledWith(id);
  });

  it('throws NotFoundException unchanged when the quest does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Quête introuvable'));
    const promise = handler.execute(new DeleteQuestCommand(id));

    await expect(promise).rejects.toThrow(NotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when the deletion fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce(quest);
    repository.delete.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new DeleteQuestCommand(id));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Suppression de la quête impossible');
  });
});
