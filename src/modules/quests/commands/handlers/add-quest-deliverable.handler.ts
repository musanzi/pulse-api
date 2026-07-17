import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestDeliverable } from '../../entities/quest-deliverable.entity';
import { FindQuestByIdQuery } from '../../queries';
import { AddQuestDeliverableCommand } from '../impl';

@CommandHandler(AddQuestDeliverableCommand)
export class AddQuestDeliverableHandler implements ICommandHandler<AddQuestDeliverableCommand, QuestDeliverable> {
  private readonly logger = new Logger(AddQuestDeliverableHandler.name);

  constructor(
    @InjectRepository(QuestDeliverable)
    private readonly repository: Repository<QuestDeliverable>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: AddQuestDeliverableCommand): Promise<QuestDeliverable> {
    const { questId, dto } = command;

    try {
      await this.queryBus.execute(new FindQuestByIdQuery(questId));

      return await this.repository.save(this.repository.create({ ...dto, questId }));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Add quest deliverable failed questId="${questId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Ajout du livrable impossible');
    }
  }
}
