import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../entities/application.entity';
import { ApplicationStatus } from '../../enums';
import { FindApplicationByIdQuery } from '../../queries';
import { AcceptApplicationCommand } from '../impl';

@CommandHandler(AcceptApplicationCommand)
export class AcceptApplicationHandler implements ICommandHandler<AcceptApplicationCommand, Application> {
  private readonly logger = new Logger(AcceptApplicationHandler.name);

  constructor(
    @InjectRepository(Application)
    private readonly repository: Repository<Application>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: AcceptApplicationCommand): Promise<Application> {
    try {
      const application = await this.queryBus.execute(new FindApplicationByIdQuery(command.id));

      if (application.status !== ApplicationStatus.PENDING) {
        throw new BadRequestException('Cette candidature a déjà été traitée');
      }

      return await this.repository.save(
        this.repository.merge(application, { status: ApplicationStatus.ACCEPTED })
      );
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;

      this.logger.error(
        `Accept application failed id="${command.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Acceptation de la candidature impossible');
    }
  }
}
