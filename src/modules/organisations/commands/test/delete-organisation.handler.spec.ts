import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { DeleteResult, Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Organisation } from '../../entities/organisation.entity';
import { DeleteOrganisationCommand } from '../impl';
import { DeleteOrganisationHandler } from '../handlers/delete-organisation.handler';

describe('DeleteOrganisationHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Organisation>, 'delete'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: DeleteOrganisationHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'organisation-id';

  beforeEach(() => {
    repository = { delete: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new DeleteOrganisationHandler(
      mockDependency<Repository<Organisation>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('deletes an existing organisation', async () => {
    queryBus.execute.mockResolvedValueOnce({ id } as Organisation);
    repository.delete.mockResolvedValueOnce({ affected: 1, raw: [] } as DeleteResult);

    await handler.execute(new DeleteOrganisationCommand(id));

    expect(repository.delete).toHaveBeenCalledWith(id);
  });

  it('throws NotFoundException unchanged when the organisation does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Organisation introuvable'));
    const promise = handler.execute(new DeleteOrganisationCommand(id));

    await expect(promise).rejects.toThrow(NotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when the deletion fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce({ id } as Organisation);
    repository.delete.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new DeleteOrganisationCommand(id));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow("Suppression de l'organisation impossible");
  });
});
