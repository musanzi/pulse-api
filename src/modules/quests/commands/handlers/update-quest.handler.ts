import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from '../../entities/quest.entity';
import { FindQuestByIdQuery } from '../../queries';
import { UpdateQuestCommand } from '../impl';

@CommandHandler(UpdateQuestCommand)
export class UpdateQuestHandler implements ICommandHandler<UpdateQuestCommand, Quest> {
  private readonly logger = new Logger(UpdateQuestHandler.name);

  constructor(
    @InjectRepository(Quest)
    private readonly repository: Repository<Quest>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UpdateQuestCommand): Promise<Quest> {
    const { dto, id } = command;

    try {
      const quest = await this.queryBus.execute(new FindQuestByIdQuery(id));

      return await this.repository.save(this.repository.merge(quest, dto));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Update quest failed id="${id}": ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Mise à jour de la quête impossible');
    }
  }
}
