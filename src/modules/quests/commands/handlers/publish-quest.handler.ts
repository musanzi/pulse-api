import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from '../../entities/quest.entity';
import { QuestStatus } from '../../enums';
import { FindQuestByIdQuery } from '../../queries';
import { PublishQuestCommand } from '../impl';

@CommandHandler(PublishQuestCommand)
export class PublishQuestHandler implements ICommandHandler<PublishQuestCommand, Quest> {
  private readonly logger = new Logger(PublishQuestHandler.name);

  constructor(
    @InjectRepository(Quest)
    private readonly repository: Repository<Quest>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: PublishQuestCommand): Promise<Quest> {
    try {
      const quest = await this.queryBus.execute(new FindQuestByIdQuery(command.id));

      return await this.repository.save(this.repository.merge(quest, { status: QuestStatus.OPEN }));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Publish quest failed id="${command.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Publication de la quête impossible');
    }
  }
}
