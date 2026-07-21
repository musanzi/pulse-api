import { BadRequestException, Logger } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Application } from '../../entities/application.entity';
import { ApplicationStatus } from '../../enums';
import { FindApplicationsQuery } from '../impl';
import { FindApplicationsHandler } from '../handlers/find-applications.handler';

describe('FindApplicationsHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Application>, 'createQueryBuilder' | 'findAndCount'>>;
  let queryBuilder: jest.Mocked<
    Pick<SelectQueryBuilder<Application>, 'orderBy' | 'andWhere' | 'skip' | 'take' | 'getManyAndCount'>
  >;
  let handler: FindApplicationsHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const applications = [{ id: 'application-id' }] as Application[];

  beforeEach(() => {
    queryBuilder = {
      orderBy: jest.fn(),
      andWhere: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      getManyAndCount: jest.fn()
    };
    queryBuilder.orderBy.mockReturnValue(mockDependency<SelectQueryBuilder<Application>>(queryBuilder));
    queryBuilder.andWhere.mockReturnValue(mockDependency<SelectQueryBuilder<Application>>(queryBuilder));
    queryBuilder.skip.mockReturnValue(mockDependency<SelectQueryBuilder<Application>>(queryBuilder));
    queryBuilder.take.mockReturnValue(mockDependency<SelectQueryBuilder<Application>>(queryBuilder));
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findAndCount: jest.fn()
    };
    handler = new FindApplicationsHandler(mockDependency<Repository<Application>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns all applications without pagination when no params are provided', async () => {
    repository.findAndCount.mockResolvedValueOnce([applications, 1]);

    const result = await handler.execute(new FindApplicationsQuery({}));

    expect(result).toEqual([applications, 1]);
    expect(repository.findAndCount).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('filters by quest, user and status with pagination', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([applications, 1]);

    await handler.execute(
      new FindApplicationsQuery({
        page: 2,
        limit: 10,
        questId: 'quest-id',
        userId: 'user-id',
        status: ApplicationStatus.PENDING
      })
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('application.questId = :questId', { questId: 'quest-id' });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('application.userId = :userId', { userId: 'user-id' });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('application.status = :status', {
      status: ApplicationStatus.PENDING
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
  });

  it.each([{ page: 0 }, { page: 1, limit: 0 }, { page: 1, limit: 101 }])(
    'throws BadRequestException when pagination parameters are invalid: %p',
    async (params) => {
      const promise = handler.execute(new FindApplicationsQuery(params));

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Les paramètres de pagination sont invalides');
    }
  );

  it('throws BadRequestException when applications cannot be found', async () => {
    repository.findAndCount.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new FindApplicationsQuery({}));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Candidatures introuvables');
  });
});
