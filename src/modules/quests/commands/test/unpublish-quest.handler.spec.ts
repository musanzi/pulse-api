import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Quest } from '../../entities/quest.entity';
import { QuestStatus } from '../../enums';
import { UnpublishQuestCommand } from '../impl';
import { UnpublishQuestHandler } from '../handlers/unpublish-quest.handler';

describe('UnpublishQuestHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Quest>, 'merge' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: UnpublishQuestHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'quest-id';
  const quest = { id, status: QuestStatus.OPEN } as Quest;
  const drafted = { id, status: QuestStatus.DRAFT } as Quest;

  beforeEach(() => {
    repository = { merge: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new UnpublishQuestHandler(
      mockDependency<Repository<Quest>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('sets the quest status back to DRAFT', async () => {
    queryBus.execute.mockResolvedValueOnce(quest);
    repository.merge.mockReturnValueOnce(drafted);
    repository.save.mockResolvedValueOnce(drafted);

    const result = await handler.execute(new UnpublishQuestCommand(id));

    expect(result).toBe(drafted);
    expect(repository.merge).toHaveBeenCalledWith(quest, { status: QuestStatus.DRAFT });
  });

  it('throws NotFoundException unchanged when the quest does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Quête introuvable'));
    const promise = handler.execute(new UnpublishQuestCommand(id));

    await expect(promise).rejects.toThrow(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when unpublishing fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce(quest);
    repository.merge.mockReturnValueOnce(drafted);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new UnpublishQuestCommand(id));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Retrait de la quête impossible');
  });
});
