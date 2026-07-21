import { Command } from '@nestjs/cqrs';
import { Application } from '../../entities/application.entity';

export class WithdrawApplicationCommand extends Command<Application> {
  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {
    super();
  }
}
