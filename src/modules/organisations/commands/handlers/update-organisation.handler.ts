import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Repository } from 'typeorm';
import { Organisation } from '../../entities/organisation.entity';
import { FindOrganisationByIdQuery } from '../../queries';
import { UpdateOrganisationCommand } from '../impl';

@CommandHandler(UpdateOrganisationCommand)
export class UpdateOrganisationHandler implements ICommandHandler<UpdateOrganisationCommand, Organisation> {
  private readonly logger = new Logger(UpdateOrganisationHandler.name);

  constructor(
    @InjectRepository(Organisation)
    private readonly repository: Repository<Organisation>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UpdateOrganisationCommand): Promise<Organisation> {
    const { dto, id } = command;

    try {
      const organisation = await this.queryBus.execute(new FindOrganisationByIdQuery(id));

      if (dto.name && dto.name !== organisation.name) {
        const existingOrganisation = await this.repository.findOne({ where: { name: dto.name } });

        if (existingOrganisation) {
          throw new ConflictException('Cette organisation existe déjà');
        }
      }

      // Keep the slug in step with the name so public URLs stay meaningful.
      const slug = dto.name ? slugify(dto.name, { lower: true, strict: true }) : organisation.slug;

      return await this.repository.save(this.repository.merge(organisation, { ...dto, slug }));
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) throw error;

      this.logger.error(
        `Update organisation failed id="${id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Mise à jour de l'organisation impossible");
    }
  }
}
