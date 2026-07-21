import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Application } from '../../entities/application.entity';
import { ApplicationStatus } from '../../enums';
import { WithdrawApplicationCommand } from '../impl';
import { WithdrawApplicationHandler } from '../handlers/withdraw-application.handler';

describe('WithdrawApplicationHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Application>, 'merge' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: WithdrawApplicationHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'application-id';
  const userId = 'user-id';
  const pending = { id, userId, status: ApplicationStatus.PENDING } as Application;
  const withdrawn = { id, userId, status: ApplicationStatus.WITHDRAWN } as Application;

  beforeEach(() => {
    repository = { merge: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new WithdrawApplicationHandler(
      mockDependency<Repository<Application>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('withdraws the applicant own pending application', async () => {
    queryBus.execute.mockResolvedValueOnce(pending);
    repository.merge.mockReturnValueOnce(withdrawn);
    repository.save.mockResolvedValueOnce(withdrawn);

    const result = await handler.execute(new WithdrawApplicationCommand(id, userId));

    expect(result).toBe(withdrawn);
    expect(repository.merge).toHaveBeenCalledWith(pending, { status: ApplicationStatus.WITHDRAWN });
  });

  it('throws ForbiddenException when withdrawing someone else application', async () => {
    queryBus.execute.mockResolvedValueOnce({ ...pending, userId: 'another-user' } as Application);
    const promise = handler.execute(new WithdrawApplicationCommand(id, userId));

    await expect(promise).rejects.toThrow(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when the application was already processed', async () => {
    queryBus.execute.mockResolvedValueOnce({ ...pending, status: ApplicationStatus.ACCEPTED } as Application);
    const promise = handler.execute(new WithdrawApplicationCommand(id, userId));

    await expect(promise).rejects.toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException unchanged when the application does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Candidature introuvable'));
    const promise = handler.execute(new WithdrawApplicationCommand(id, userId));

    await expect(promise).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when saving fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce(pending);
    repository.merge.mockReturnValueOnce(withdrawn);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new WithdrawApplicationCommand(id, userId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Retrait de la candidature impossible');
  });
});
