import { Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Application } from '../../entities/application.entity';
import { FindApplicationByIdQuery } from '../impl';
import { FindApplicationByIdHandler } from '../handlers/find-application-by-id.handler';

describe('FindApplicationByIdHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Application>, 'findOneOrFail'>>;
  let handler: FindApplicationByIdHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const application = { id: 'application-id' } as Application;

  beforeEach(() => {
    repository = { findOneOrFail: jest.fn() };
    handler = new FindApplicationByIdHandler(mockDependency<Repository<Application>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns the application when it exists', async () => {
    repository.findOneOrFail.mockResolvedValueOnce(application);

    const result = await handler.execute(new FindApplicationByIdQuery('application-id'));

    expect(result).toBe(application);
    expect(repository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 'application-id' } });
  });

  it('throws NotFoundException when the application does not exist', async () => {
    repository.findOneOrFail.mockRejectedValueOnce(new Error('not found'));
    const promise = handler.execute(new FindApplicationByIdQuery('missing-id'));

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Candidature introuvable');
  });
});
