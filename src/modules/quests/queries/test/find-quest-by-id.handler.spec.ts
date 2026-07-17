import { Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Quest } from '../../entities/quest.entity';
import { FindQuestByIdQuery } from '../impl';
import { FindQuestByIdHandler } from '../handlers/find-quest-by-id.handler';

describe('FindQuestByIdHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Quest>, 'findOneOrFail'>>;
  let handler: FindQuestByIdHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const quest = { id: 'quest-id', title: 'Build a fintech API' } as Quest;

  beforeEach(() => {
    repository = {
      findOneOrFail: jest.fn()
    };
    handler = new FindQuestByIdHandler(mockDependency<Repository<Quest>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns the quest when it exists', async () => {
    repository.findOneOrFail.mockResolvedValueOnce(quest);

    const result = await handler.execute(new FindQuestByIdQuery('quest-id'));

    expect(result).toBe(quest);
    expect(repository.findOneOrFail).toHaveBeenCalledWith({
      where: { id: 'quest-id' },
      relations: { deliverables: true, skills: true }
    });
  });

  it('throws NotFoundException when the quest does not exist', async () => {
    repository.findOneOrFail.mockRejectedValueOnce(new Error('not found'));
    const promise = handler.execute(new FindQuestByIdQuery('missing-id'));

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Quête introuvable');
  });
});
