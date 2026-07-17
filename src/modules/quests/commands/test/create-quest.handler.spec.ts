import { BadRequestException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Quest } from '../../entities/quest.entity';
import { QuestDomain } from '../../enums';
import { CreateQuestCommand } from '../impl';
import { CreateQuestHandler } from '../handlers/create-quest.handler';

describe('CreateQuestHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Quest>, 'create' | 'save'>>;
  let handler: CreateQuestHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const dto = {
    title: 'Build a fintech API',
    description: 'Ship a small NestJS API',
    domain: QuestDomain.CODING,
    organisationId: '11111111-1111-1111-1111-111111111111'
  };
  const quest = { id: 'quest-id', ...dto } as Quest;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn()
    };
    handler = new CreateQuestHandler(mockDependency<Repository<Quest>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('creates a quest from the provided payload', async () => {
    repository.create.mockReturnValueOnce(quest);
    repository.save.mockResolvedValueOnce(quest);

    const result = await handler.execute(new CreateQuestCommand(dto, 'user-id'));

    expect(result).toBe(quest);
    expect(repository.create).toHaveBeenCalledWith({ ...dto, createdById: 'user-id' });
    expect(repository.save).toHaveBeenCalledWith(quest);
  });

  it('throws BadRequestException when quest creation fails unexpectedly', async () => {
    repository.create.mockReturnValueOnce(quest);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new CreateQuestCommand(dto));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Création de la quête impossible');
  });
});
