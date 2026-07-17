import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from '../../entities/quest.entity';
import { CreateQuestCommand } from '../impl';

@CommandHandler(CreateQuestCommand)
export class CreateQuestHandler implements ICommandHandler<CreateQuestCommand, Quest> {
  private readonly logger = new Logger(CreateQuestHandler.name);

  constructor(
    @InjectRepository(Quest)
    private readonly repository: Repository<Quest>
  ) {}

  async execute(command: CreateQuestCommand): Promise<Quest> {
    try {
      return await this.repository.save(this.repository.create(command.dto));
    } catch (error) {
      this.logger.error(
        `Create quest failed title="${command.dto.title}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Création de la quête impossible');
    }
  }
}
