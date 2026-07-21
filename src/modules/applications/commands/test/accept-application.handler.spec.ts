import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Application } from '../../entities/application.entity';
import { ApplicationStatus } from '../../enums';
import { AcceptApplicationCommand } from '../impl';
import { AcceptApplicationHandler } from '../handlers/accept-application.handler';

describe('AcceptApplicationHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Application>, 'merge' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: AcceptApplicationHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'application-id';
  const pending = { id, status: ApplicationStatus.PENDING } as Application;
  const accepted = { id, status: ApplicationStatus.ACCEPTED } as Application;

  beforeEach(() => {
    repository = { merge: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new AcceptApplicationHandler(
      mockDependency<Repository<Application>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('accepts a pending application', async () => {
    queryBus.execute.mockResolvedValueOnce(pending);
    repository.merge.mockReturnValueOnce(accepted);
    repository.save.mockResolvedValueOnce(accepted);

    const result = await handler.execute(new AcceptApplicationCommand(id));

    expect(result).toBe(accepted);
    expect(repository.merge).toHaveBeenCalledWith(pending, { status: ApplicationStatus.ACCEPTED });
  });

  it('throws BadRequestException when the application was already processed', async () => {
    queryBus.execute.mockResolvedValueOnce({ id, status: ApplicationStatus.REJECTED } as Application);
    const promise = handler.execute(new AcceptApplicationCommand(id));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Cette candidature a déjà été traitée');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException unchanged when the application does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Candidature introuvable'));
    const promise = handler.execute(new AcceptApplicationCommand(id));

    await expect(promise).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when saving fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce(pending);
    repository.merge.mockReturnValueOnce(accepted);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new AcceptApplicationCommand(id));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Acceptation de la candidature impossible');
  });
});
