import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestDeliverable } from '../../entities/quest-deliverable.entity';
import { RemoveQuestDeliverableCommand } from '../impl';

@CommandHandler(RemoveQuestDeliverableCommand)
export class RemoveQuestDeliverableHandler implements ICommandHandler<RemoveQuestDeliverableCommand, void> {
  private readonly logger = new Logger(RemoveQuestDeliverableHandler.name);

  constructor(
    @InjectRepository(QuestDeliverable)
    private readonly repository: Repository<QuestDeliverable>
  ) {}

  async execute(command: RemoveQuestDeliverableCommand): Promise<void> {
    const { questId, deliverableId } = command;

    try {
      const deliverable = await this.repository.findOne({ where: { id: deliverableId, questId } });

      if (!deliverable) {
        throw new NotFoundException('Livrable introuvable');
      }

      await this.repository.delete(deliverableId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Remove quest deliverable failed id="${deliverableId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Suppression du livrable impossible');
    }
  }
}
