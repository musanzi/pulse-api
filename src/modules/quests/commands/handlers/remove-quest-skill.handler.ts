import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestSkill } from '../../entities/quest-skill.entity';
import { RemoveQuestSkillCommand } from '../impl';

@CommandHandler(RemoveQuestSkillCommand)
export class RemoveQuestSkillHandler implements ICommandHandler<RemoveQuestSkillCommand, void> {
  private readonly logger = new Logger(RemoveQuestSkillHandler.name);

  constructor(
    @InjectRepository(QuestSkill)
    private readonly repository: Repository<QuestSkill>
  ) {}

  async execute(command: RemoveQuestSkillCommand): Promise<void> {
    const { questId, questSkillId } = command;

    try {
      const questSkill = await this.repository.findOne({ where: { id: questSkillId, questId } });

      if (!questSkill) {
        throw new NotFoundException('Compétence introuvable');
      }

      await this.repository.delete(questSkillId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Remove quest skill failed id="${questSkillId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Suppression de la compétence impossible');
    }
  }
}
