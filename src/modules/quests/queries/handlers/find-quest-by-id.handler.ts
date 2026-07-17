import { Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from '../../entities/quest.entity';
import { FindQuestByIdQuery } from '../impl';

@QueryHandler(FindQuestByIdQuery)
export class FindQuestByIdHandler implements IQueryHandler<FindQuestByIdQuery, Quest> {
  private readonly logger = new Logger(FindQuestByIdHandler.name);

  constructor(
    @InjectRepository(Quest)
    private readonly repository: Repository<Quest>
  ) {}

  async execute(query: FindQuestByIdQuery): Promise<Quest> {
    try {
      return await this.repository.findOneOrFail({
        where: { id: query.id },
        relations: { deliverables: true, skills: true }
      });
    } catch (error) {
      this.logger.error(
        `Find quest by id failed id="${query.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('Quête introuvable');
    }
  }
}
