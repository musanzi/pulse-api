import { Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../entities/application.entity';
import { FindApplicationByIdQuery } from '../impl';

@QueryHandler(FindApplicationByIdQuery)
export class FindApplicationByIdHandler implements IQueryHandler<FindApplicationByIdQuery, Application> {
  private readonly logger = new Logger(FindApplicationByIdHandler.name);

  constructor(
    @InjectRepository(Application)
    private readonly repository: Repository<Application>
  ) {}

  async execute(query: FindApplicationByIdQuery): Promise<Application> {
    try {
      return await this.repository.findOneOrFail({
        where: { id: query.id }
      });
    } catch (error) {
      this.logger.error(
        `Find application by id failed id="${query.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('Candidature introuvable');
    }
  }
}
