import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from '../../entities/organisation.entity';
import { FindOrganisationByIdQuery } from '../../queries';
import { DeleteOrganisationCommand } from '../impl';

@CommandHandler(DeleteOrganisationCommand)
export class DeleteOrganisationHandler implements ICommandHandler<DeleteOrganisationCommand, void> {
  private readonly logger = new Logger(DeleteOrganisationHandler.name);

  constructor(
    @InjectRepository(Organisation)
    private readonly repository: Repository<Organisation>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: DeleteOrganisationCommand): Promise<void> {
    try {
      await this.queryBus.execute(new FindOrganisationByIdQuery(command.id));

      await this.repository.delete(command.id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Delete organisation failed id="${command.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Suppression de l'organisation impossible");
    }
  }
}
