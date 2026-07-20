import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parsePaginationParams } from '@/shared/helpers';
import { Application } from '../../entities/application.entity';
import { FindApplicationsQuery } from '../impl/find-applications.query';

@QueryHandler(FindApplicationsQuery)
export class FindApplicationsHandler implements IQueryHandler<FindApplicationsQuery, [Application[], number]> {
  private readonly logger = new Logger(FindApplicationsHandler.name);

  constructor(
    @InjectRepository(Application)
    private readonly repository: Repository<Application>
  ) {}

  async execute(query: FindApplicationsQuery): Promise<[Application[], number]> {
    try {
      const { questId, userId, status } = query.params;

      if (Object.keys(query.params).length === 0) {
        return await this.repository.findAndCount({
          order: { createdAt: 'DESC' }
        });
      }

      const { pageNumber, limitNumber } = parsePaginationParams(query.params);
      const queryBuilder = this.repository
        .createQueryBuilder('application')
        .orderBy('application.createdAt', 'DESC');

      if (questId) queryBuilder.andWhere('application.questId = :questId', { questId });
      if (userId) queryBuilder.andWhere('application.userId = :userId', { userId });
      if (status) queryBuilder.andWhere('application.status = :status', { status });

      return await queryBuilder
        .skip((pageNumber - 1) * limitNumber)
        .take(limitNumber)
        .getManyAndCount();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      this.logger.error(
        `Find applications failed params="${JSON.stringify(query.params)}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Candidatures introuvables');
    }
  }
}
