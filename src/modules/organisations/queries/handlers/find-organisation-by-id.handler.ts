import { Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from '../../entities/organisation.entity';
import { FindOrganisationByIdQuery } from '../impl';

@QueryHandler(FindOrganisationByIdQuery)
export class FindOrganisationByIdHandler implements IQueryHandler<FindOrganisationByIdQuery, Organisation> {
  private readonly logger = new Logger(FindOrganisationByIdHandler.name);

  constructor(
    @InjectRepository(Organisation)
    private readonly repository: Repository<Organisation>
  ) {}

  async execute(query: FindOrganisationByIdQuery): Promise<Organisation> {
    try {
      return await this.repository.findOneOrFail({
        where: { id: query.id },
        relations: { members: true }
      });
    } catch (error) {
      this.logger.error(
        `Find organisation by id failed id="${query.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('Organisation introuvable');
    }
  }
}
