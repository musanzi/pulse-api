import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Quest } from '@/modules/quests/entities/quest.entity';
import { QuestDomain, QuestStatus } from '@/modules/quests/enums';
import { Application } from '../../entities/application.entity';
import { CreateApplicationCommand } from '../impl';
import { CreateApplicationHandler } from '../handlers/create-application.handler';

describe('CreateApplicationHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Application>, 'findOne' | 'create' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: CreateApplicationHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const userId = 'user-id';
  const questId = 'quest-id';
  const dto = { questId, motivation: 'I want in' };
  const openQuest = { id: questId, status: QuestStatus.OPEN, domain: QuestDomain.CODING } as Quest;
  const application = { id: 'application-id', questId, userId } as Application;

  beforeEach(() => {
    repository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new CreateApplicationHandler(
      mockDependency<Repository<Application>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('creates an application for an open quest', async () => {
    queryBus.execute.mockResolvedValueOnce(openQuest);
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(application);
    repository.save.mockResolvedValueOnce(application);

    const result = await handler.execute(new CreateApplicationCommand(dto, userId));

    expect(result).toBe(application);
    expect(repository.create).toHaveBeenCalledWith({ ...dto, userId });
  });

  it('validates domainDetails against the quest domain and stores them', async () => {
    const dtoWithDetails = { questId, domainDetails: { programmingLanguages: ['Python'], yearsExperience: 4 } };
    queryBus.execute.mockResolvedValueOnce(openQuest);
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(application);
    repository.save.mockResolvedValueOnce(application);

    await handler.execute(new CreateApplicationCommand(dtoWithDetails, userId));

    expect(repository.create).toHaveBeenCalledWith({ ...dtoWithDetails, userId });
  });

  it('throws BadRequestException when domainDetails do not match the quest domain', async () => {
    const badDto = { questId, domainDetails: { githubRepo: 'javascript:alert(1)' } };
    queryBus.execute.mockResolvedValueOnce(openQuest);
    repository.findOne.mockResolvedValueOnce(null);

    const promise = handler.execute(new CreateApplicationCommand(badDto, userId));

    await expect(promise).rejects.toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when the quest is not open', async () => {
    queryBus.execute.mockResolvedValueOnce({ ...openQuest, status: QuestStatus.DRAFT } as Quest);
    const promise = handler.execute(new CreateApplicationCommand(dto, userId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow("Cette quête n'accepte pas de candidatures");
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when the user already applied', async () => {
    queryBus.execute.mockResolvedValueOnce(openQuest);
    repository.findOne.mockResolvedValueOnce(application);

    const promise = handler.execute(new CreateApplicationCommand(dto, userId));

    await expect(promise).rejects.toThrow(ConflictException);
    await expect(promise).rejects.toThrow('Vous avez déjà postulé à cette quête');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException unchanged when the quest does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Quête introuvable'));
    const promise = handler.execute(new CreateApplicationCommand(dto, userId));

    await expect(promise).rejects.toThrow(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when saving fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce(openQuest);
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(application);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new CreateApplicationCommand(dto, userId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Candidature impossible');
  });
});
