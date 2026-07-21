import { BadRequestException, Logger } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Organisation } from '../../entities/organisation.entity';
import { FindOrganisationsQuery } from '../impl';
import { FindOrganisationsHandler } from '../handlers/find-organisations.handler';

describe('FindOrganisationsHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Organisation>, 'createQueryBuilder' | 'findAndCount'>>;
  let queryBuilder: jest.Mocked<
    Pick<SelectQueryBuilder<Organisation>, 'orderBy' | 'andWhere' | 'skip' | 'take' | 'getManyAndCount'>
  >;
  let handler: FindOrganisationsHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const organisations = [{ id: 'organisation-id', name: 'Cinolu Group' }] as Organisation[];

  beforeEach(() => {
    queryBuilder = {
      orderBy: jest.fn(),
      andWhere: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      getManyAndCount: jest.fn()
    };
    queryBuilder.orderBy.mockReturnValue(mockDependency<SelectQueryBuilder<Organisation>>(queryBuilder));
    queryBuilder.andWhere.mockReturnValue(mockDependency<SelectQueryBuilder<Organisation>>(queryBuilder));
    queryBuilder.skip.mockReturnValue(mockDependency<SelectQueryBuilder<Organisation>>(queryBuilder));
    queryBuilder.take.mockReturnValue(mockDependency<SelectQueryBuilder<Organisation>>(queryBuilder));
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findAndCount: jest.fn()
    };
    handler = new FindOrganisationsHandler(mockDependency<Repository<Organisation>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns all organisations without pagination when no params are provided', async () => {
    repository.findAndCount.mockResolvedValueOnce([organisations, 1]);

    const result = await handler.execute(new FindOrganisationsQuery({}));

    expect(result).toEqual([organisations, 1]);
    expect(repository.findAndCount).toHaveBeenCalledWith({ order: { updatedAt: 'DESC' } });
  });

  it('filters by search query and sector with pagination', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([organisations, 1]);

    await handler.execute(new FindOrganisationsQuery({ page: 2, limit: 10, q: 'cinolu', sector: 'Tech' }));

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('organisation.name LIKE :name', { name: '%cinolu%' });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('organisation.sector = :sector', { sector: 'Tech' });
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
  });

  it.each([{ page: 0 }, { page: 1, limit: 0 }, { page: 1, limit: 101 }])(
    'throws BadRequestException when pagination parameters are invalid: %p',
    async (params) => {
      const promise = handler.execute(new FindOrganisationsQuery(params));

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Les paramètres de pagination sont invalides');
    }
  );

  it('throws BadRequestException when organisations cannot be found', async () => {
    repository.findAndCount.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new FindOrganisationsQuery({}));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Organisations introuvables');
  });
});
