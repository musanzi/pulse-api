import { Command } from '@nestjs/cqrs';
import { LearningPathStep } from '../../entities/learning-path-step.entity';

export class CompleteLearningStepCommand extends Command<LearningPathStep> {
  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {
    super();
  }
}
