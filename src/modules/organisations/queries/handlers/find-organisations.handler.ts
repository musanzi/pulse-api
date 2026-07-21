import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parsePaginationParams } from '@/shared/helpers';
import { Organisation } from '../../entities/organisation.entity';
import { FindOrganisationsQuery } from '../impl/find-organisations.query';

@QueryHandler(FindOrganisationsQuery)
export class FindOrganisationsHandler implements IQueryHandler<FindOrganisationsQuery, [Organisation[], number]> {
  private readonly logger = new Logger(FindOrganisationsHandler.name);

  constructor(
    @InjectRepository(Organisation)
    private readonly repository: Repository<Organisation>
  ) {}

  async execute(query: FindOrganisationsQuery): Promise<[Organisation[], number]> {
    try {
      const { q, sector } = query.params;

      if (Object.keys(query.params).length === 0) {
        return await this.repository.findAndCount({
          order: { updatedAt: 'DESC' }
        });
      }

      const { pageNumber, limitNumber } = parsePaginationParams(query.params);
      const queryBuilder = this.repository
        .createQueryBuilder('organisation')
        .orderBy('organisation.updatedAt', 'DESC');

      if (q) queryBuilder.andWhere('organisation.name LIKE :name', { name: `%${q}%` });
      if (sector) queryBuilder.andWhere('organisation.sector = :sector', { sector });

      return await queryBuilder
        .skip((pageNumber - 1) * limitNumber)
        .take(limitNumber)
        .getManyAndCount();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      this.logger.error(
        `Find organisations failed params="${JSON.stringify(query.params)}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Organisations introuvables');
    }
  }
}
