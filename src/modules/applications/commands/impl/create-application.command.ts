import { Command } from '@nestjs/cqrs';
import { CreateApplicationDto } from '../../dto/create-application.dto';
import { Application } from '../../entities/application.entity';

export class CreateApplicationCommand extends Command<Application> {
  constructor(
    public readonly dto: CreateApplicationDto,
    public readonly userId: string
  ) {
    super();
  }
}
