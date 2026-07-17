import { BadRequestException, Logger } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Quest } from '../../entities/quest.entity';
import { QuestDomain, QuestStatus } from '../../enums';
import { FindQuestsQuery } from '../impl';
import { FindQuestsHandler } from '../handlers/find-quests.handler';

describe('FindQuestsHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Quest>, 'createQueryBuilder' | 'findAndCount'>>;
  let queryBuilder: jest.Mocked<
    Pick<SelectQueryBuilder<Quest>, 'orderBy' | 'andWhere' | 'skip' | 'take' | 'getManyAndCount'>
  >;
  let handler: FindQuestsHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const quests = [{ id: 'quest-id', title: 'Build a fintech API' }] as Quest[];

  beforeEach(() => {
    queryBuilder = {
      orderBy: jest.fn(),
      andWhere: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      getManyAndCount: jest.fn()
    };
    queryBuilder.orderBy.mockReturnValue(mockDependency<SelectQueryBuilder<Quest>>(queryBuilder));
    queryBuilder.andWhere.mockReturnValue(mockDependency<SelectQueryBuilder<Quest>>(queryBuilder));
    queryBuilder.skip.mockReturnValue(mockDependency<SelectQueryBuilder<Quest>>(queryBuilder));
    queryBuilder.take.mockReturnValue(mockDependency<SelectQueryBuilder<Quest>>(queryBuilder));
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findAndCount: jest.fn()
    };
    handler = new FindQuestsHandler(mockDependency<Repository<Quest>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns all quests without pagination when no query params are provided', async () => {
    repository.findAndCount.mockResolvedValueOnce([quests, 1]);

    const result = await handler.execute(new FindQuestsQuery({}));

    expect(result).toEqual([quests, 1]);
    expect(repository.findAndCount).toHaveBeenCalledWith({ order: { updatedAt: 'DESC' } });
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('filters by search query, domain, and status using the requested page and limit', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([quests, 1]);

    const result = await handler.execute(
      new FindQuestsQuery({ page: 2, limit: 25, q: 'fintech', domain: QuestDomain.CODING, status: QuestStatus.OPEN })
    );

    expect(result).toEqual([quests, 1]);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('quest');
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('quest.updatedAt', 'DESC');
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('quest.title LIKE :title', { title: '%fintech%' });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('quest.domain = :domain', { domain: QuestDomain.CODING });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('quest.status = :status', { status: QuestStatus.OPEN });
    expect(queryBuilder.skip).toHaveBeenCalledWith(25);
    expect(queryBuilder.take).toHaveBeenCalledWith(25);
  });

  it('defaults to the first page when query params are provided without pagination params', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([quests, 1]);

    await handler.execute(new FindQuestsQuery({ q: 'fintech' }));

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('quest.title LIKE :title', { title: '%fintech%' });
    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(20);
  });

  it('does not filter by title when an empty search query is provided', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([quests, 1]);

    await handler.execute(new FindQuestsQuery({ q: '' }));

    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(20);
    expect(repository.findAndCount).not.toHaveBeenCalled();
  });

  it.each([{ page: 0 }, { page: 1, limit: 0 }, { page: 1, limit: -1 }, { page: 1, limit: 101 }, { page: 1, limit: 'abc' }])(
    'throws BadRequestException when pagination parameters are invalid: %p',
    async (params) => {
      const promise = handler.execute(new FindQuestsQuery(params));

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Les paramètres de pagination sont invalides');
      expect(repository.createQueryBuilder).not.toHaveBeenCalled();
    }
  );

  it('throws BadRequestException when quests cannot be found', async () => {
    repository.findAndCount.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new FindQuestsQuery({}));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Quêtes introuvables');
  });
});
