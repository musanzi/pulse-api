import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPathStep } from '../../entities/learning-path-step.entity';
import { CompleteLearningStepCommand } from '../impl';

@CommandHandler(CompleteLearningStepCommand)
export class CompleteLearningStepHandler implements ICommandHandler<CompleteLearningStepCommand, LearningPathStep> {
  private readonly logger = new Logger(CompleteLearningStepHandler.name);

  constructor(
    @InjectRepository(LearningPathStep)
    private readonly repository: Repository<LearningPathStep>
  ) {}

  async execute(command: CompleteLearningStepCommand): Promise<LearningPathStep> {
    const { id, userId } = command;

    try {
      const step = await this.repository.findOne({ where: { id }, relations: { recommendation: true } });

      if (!step) {
        throw new NotFoundException('Étape introuvable');
      }

      if (step.recommendation?.userId !== userId) {
        throw new ForbiddenException('Vous ne pouvez modifier que votre propre parcours');
      }

      return await this.repository.save(this.repository.merge(step, { isCompleted: true }));
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;

      this.logger.error(
        `Complete learning step failed id="${id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Validation de l'étape impossible");
    }
  }
}
