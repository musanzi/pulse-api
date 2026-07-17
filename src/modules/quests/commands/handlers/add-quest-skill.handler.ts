import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestSkill } from '../../entities/quest-skill.entity';
import { FindQuestByIdQuery } from '../../queries';
import { AddQuestSkillCommand } from '../impl';

@CommandHandler(AddQuestSkillCommand)
export class AddQuestSkillHandler implements ICommandHandler<AddQuestSkillCommand, QuestSkill> {
  private readonly logger = new Logger(AddQuestSkillHandler.name);

  constructor(
    @InjectRepository(QuestSkill)
    private readonly repository: Repository<QuestSkill>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: AddQuestSkillCommand): Promise<QuestSkill> {
    const { questId, dto } = command;

    try {
      await this.queryBus.execute(new FindQuestByIdQuery(questId));

      return await this.repository.save(this.repository.create({ ...dto, questId }));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Add quest skill failed questId="${questId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Ajout de la compétence impossible');
    }
  }
}
