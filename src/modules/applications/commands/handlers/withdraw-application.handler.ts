import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../entities/application.entity';
import { ApplicationStatus } from '../../enums';
import { FindApplicationByIdQuery } from '../../queries';
import { WithdrawApplicationCommand } from '../impl';

@CommandHandler(WithdrawApplicationCommand)
export class WithdrawApplicationHandler implements ICommandHandler<WithdrawApplicationCommand, Application> {
  private readonly logger = new Logger(WithdrawApplicationHandler.name);

  constructor(
    @InjectRepository(Application)
    private readonly repository: Repository<Application>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: WithdrawApplicationCommand): Promise<Application> {
    const { id, userId } = command;

    try {
      const application = await this.queryBus.execute(new FindApplicationByIdQuery(id));

      if (application.userId !== userId) {
        throw new ForbiddenException('Vous ne pouvez retirer que vos propres candidatures');
      }

      if (application.status !== ApplicationStatus.PENDING) {
        throw new BadRequestException('Cette candidature a déjà été traitée');
      }

      return await this.repository.save(
        this.repository.merge(application, { status: ApplicationStatus.WITHDRAWN })
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Withdraw application failed id="${id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Retrait de la candidature impossible');
    }
  }
}
