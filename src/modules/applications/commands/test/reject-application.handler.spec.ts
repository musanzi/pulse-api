import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Application } from '../../entities/application.entity';
import { ApplicationStatus } from '../../enums';
import { RejectApplicationCommand } from '../impl';
import { RejectApplicationHandler } from '../handlers/reject-application.handler';

describe('RejectApplicationHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Application>, 'merge' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: RejectApplicationHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'application-id';
  const pending = { id, status: ApplicationStatus.PENDING } as Application;
  const rejected = { id, status: ApplicationStatus.REJECTED } as Application;

  beforeEach(() => {
    repository = { merge: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new RejectApplicationHandler(
      mockDependency<Repository<Application>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('rejects a pending application', async () => {
    queryBus.execute.mockResolvedValueOnce(pending);
    repository.merge.mockReturnValueOnce(rejected);
    repository.save.mockResolvedValueOnce(rejected);

    const result = await handler.execute(new RejectApplicationCommand(id));

    expect(result).toBe(rejected);
    expect(repository.merge).toHaveBeenCalledWith(pending, { status: ApplicationStatus.REJECTED });
  });

  it('throws BadRequestException when the application was already processed', async () => {
    queryBus.execute.mockResolvedValueOnce({ id, status: ApplicationStatus.ACCEPTED } as Application);
    const promise = handler.execute(new RejectApplicationCommand(id));

    await expect(promise).rejects.toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException unchanged when the application does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Candidature introuvable'));
    const promise = handler.execute(new RejectApplicationCommand(id));

    await expect(promise).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when saving fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce(pending);
    repository.merge.mockReturnValueOnce(rejected);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new RejectApplicationCommand(id));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Refus de la candidature impossible');
  });
});
