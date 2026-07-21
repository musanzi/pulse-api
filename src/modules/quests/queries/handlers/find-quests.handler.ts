import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parsePaginationParams } from '@/shared/helpers';
import { Quest } from '../../entities/quest.entity';
import { FindQuestsQuery } from '../impl/find-quests.query';

@QueryHandler(FindQuestsQuery)
export class FindQuestsHandler implements IQueryHandler<FindQuestsQuery, [Quest[], number]> {
  private readonly logger = new Logger(FindQuestsHandler.name);

  constructor(
    @InjectRepository(Quest)
    private readonly repository: Repository<Quest>
  ) {}

  async execute(query: FindQuestsQuery): Promise<[Quest[], number]> {
    try {
      const { q, domain, status } = query.params;

      if (Object.keys(query.params).length === 0) {
        return await this.repository.findAndCount({
          order: { updatedAt: 'DESC' }
        });
      }

      const { pageNumber, limitNumber } = parsePaginationParams(query.params);
      const queryBuilder = this.repository.createQueryBuilder('quest').orderBy('quest.updatedAt', 'DESC');

      if (q) queryBuilder.andWhere('quest.title LIKE :title', { title: `%${q}%` });
      if (domain) queryBuilder.andWhere('quest.domain = :domain', { domain });
      if (status) queryBuilder.andWhere('quest.status = :status', { status });

      return await queryBuilder
        .skip((pageNumber - 1) * limitNumber)
        .take(limitNumber)
        .getManyAndCount();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      this.logger.error(
        `Find quests failed params="${JSON.stringify(query.params)}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Quêtes introuvables');
    }
  }
}
