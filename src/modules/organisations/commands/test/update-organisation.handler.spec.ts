import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Organisation } from '../../entities/organisation.entity';
import { UpdateOrganisationCommand } from '../impl';
import { UpdateOrganisationHandler } from '../handlers/update-organisation.handler';

describe('UpdateOrganisationHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Organisation>, 'findOne' | 'merge' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: UpdateOrganisationHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const id = 'organisation-id';
  const organisation = { id, name: 'Cinolu Group', slug: 'cinolu-group' } as Organisation;

  beforeEach(() => {
    repository = { findOne: jest.fn(), merge: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new UpdateOrganisationHandler(
      mockDependency<Repository<Organisation>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('regenerates the slug when the name changes', async () => {
    const renamed = { ...organisation, name: 'Cinolu Labs', slug: 'cinolu-labs' } as Organisation;
    queryBus.execute.mockResolvedValueOnce(organisation);
    repository.findOne.mockResolvedValueOnce(null);
    repository.merge.mockReturnValueOnce(renamed);
    repository.save.mockResolvedValueOnce(renamed);

    const result = await handler.execute(new UpdateOrganisationCommand(id, { name: 'Cinolu Labs' }));

    expect(result).toBe(renamed);
    expect(repository.merge).toHaveBeenCalledWith(organisation, { name: 'Cinolu Labs', slug: 'cinolu-labs' });
  });

  it('keeps the existing slug when the name is unchanged', async () => {
    queryBus.execute.mockResolvedValueOnce(organisation);
    repository.merge.mockReturnValueOnce(organisation);
    repository.save.mockResolvedValueOnce(organisation);

    await handler.execute(new UpdateOrganisationCommand(id, { sector: 'Fintech' }));

    expect(repository.merge).toHaveBeenCalledWith(organisation, { sector: 'Fintech', slug: 'cinolu-group' });
  });

  it('throws ConflictException when renaming to an existing organisation name', async () => {
    queryBus.execute.mockResolvedValueOnce(organisation);
    repository.findOne.mockResolvedValueOnce({ id: 'another-id' } as Organisation);

    const promise = handler.execute(new UpdateOrganisationCommand(id, { name: 'Taken' }));

    await expect(promise).rejects.toThrow(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException unchanged when the organisation does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Organisation introuvable'));
    const promise = handler.execute(new UpdateOrganisationCommand(id, { sector: 'Tech' }));

    await expect(promise).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when the update fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce(organisation);
    repository.merge.mockReturnValueOnce(organisation);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new UpdateOrganisationCommand(id, { sector: 'Tech' }));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow("Mise à jour de l'organisation impossible");
  });
});
