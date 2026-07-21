import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../entities/application.entity';
import { ApplicationStatus } from '../../enums';
import { FindApplicationByIdQuery } from '../../queries';
import { RejectApplicationCommand } from '../impl';

@CommandHandler(RejectApplicationCommand)
export class RejectApplicationHandler implements ICommandHandler<RejectApplicationCommand, Application> {
  private readonly logger = new Logger(RejectApplicationHandler.name);

  constructor(
    @InjectRepository(Application)
    private readonly repository: Repository<Application>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: RejectApplicationCommand): Promise<Application> {
    try {
      const application = await this.queryBus.execute(new FindApplicationByIdQuery(command.id));

      if (application.status !== ApplicationStatus.PENDING) {
        throw new BadRequestException('Cette candidature a déjà été traitée');
      }

      return await this.repository.save(
        this.repository.merge(application, { status: ApplicationStatus.REJECTED })
      );
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;

      this.logger.error(
        `Reject application failed id="${command.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Refus de la candidature impossible');
    }
  }
}
