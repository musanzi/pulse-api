import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from '../../entities/quest.entity';
import { FindQuestByIdQuery } from '../../queries';
import { DeleteQuestCommand } from '../impl';

@CommandHandler(DeleteQuestCommand)
export class DeleteQuestHandler implements ICommandHandler<DeleteQuestCommand, void> {
  private readonly logger = new Logger(DeleteQuestHandler.name);

  constructor(
    @InjectRepository(Quest)
    private readonly repository: Repository<Quest>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: DeleteQuestCommand): Promise<void> {
    try {
      await this.queryBus.execute(new FindQuestByIdQuery(command.id));

      await this.repository.delete(command.id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Delete quest failed id="${command.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Suppression de la quête impossible');
    }
  }
}
