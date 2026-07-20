import { Command } from '@nestjs/cqrs';
import { Application } from '../../entities/application.entity';

export class RejectApplicationCommand extends Command<Application> {
  constructor(public readonly id: string) {
    super();
  }
}
