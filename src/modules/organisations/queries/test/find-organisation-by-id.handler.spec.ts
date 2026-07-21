import { Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Organisation } from '../../entities/organisation.entity';
import { FindOrganisationByIdQuery } from '../impl';
import { FindOrganisationByIdHandler } from '../handlers/find-organisation-by-id.handler';

describe('FindOrganisationByIdHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Organisation>, 'findOneOrFail'>>;
  let handler: FindOrganisationByIdHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const organisation = { id: 'organisation-id', name: 'Cinolu Group' } as Organisation;

  beforeEach(() => {
    repository = { findOneOrFail: jest.fn() };
    handler = new FindOrganisationByIdHandler(mockDependency<Repository<Organisation>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns the organisation with its members', async () => {
    repository.findOneOrFail.mockResolvedValueOnce(organisation);

    const result = await handler.execute(new FindOrganisationByIdQuery('organisation-id'));

    expect(result).toBe(organisation);
    expect(repository.findOneOrFail).toHaveBeenCalledWith({
      where: { id: 'organisation-id' },
      relations: { members: true }
    });
  });

  it('throws NotFoundException when the organisation does not exist', async () => {
    repository.findOneOrFail.mockRejectedValueOnce(new Error('not found'));
    const promise = handler.execute(new FindOrganisationByIdQuery('missing-id'));

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Organisation introuvable');
  });
});
