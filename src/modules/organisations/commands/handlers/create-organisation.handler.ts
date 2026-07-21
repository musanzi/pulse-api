import { BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Repository } from 'typeorm';
import { OrganisationMember } from '../../entities/organisation-member.entity';
import { Organisation } from '../../entities/organisation.entity';
import { OrgMemberRole } from '../../enums';
import { CreateOrganisationCommand } from '../impl';

@CommandHandler(CreateOrganisationCommand)
export class CreateOrganisationHandler implements ICommandHandler<CreateOrganisationCommand, Organisation> {
  private readonly logger = new Logger(CreateOrganisationHandler.name);

  constructor(
    @InjectRepository(Organisation)
    private readonly repository: Repository<Organisation>,
    @InjectRepository(OrganisationMember)
    private readonly memberRepository: Repository<OrganisationMember>
  ) {}

  async execute(command: CreateOrganisationCommand): Promise<Organisation> {
    const { dto, ownerId } = command;

    try {
      const existingOrganisation = await this.repository.findOne({ where: { name: dto.name } });

      if (existingOrganisation) {
        throw new ConflictException('Cette organisation existe déjà');
      }

      const organisation = await this.repository.save(
        this.repository.create({ ...dto, slug: slugify(dto.name, { lower: true, strict: true }) })
      );

      // The creator becomes the first OWNER — the schema has no Organisation.createdById.
      await this.memberRepository.save(
        this.memberRepository.create({
          organisationId: organisation.id,
          userId: ownerId,
          memberRole: OrgMemberRole.OWNER
        })
      );

      return organisation;
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      this.logger.error(
        `Create organisation failed name="${dto.name}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Création de l'organisation impossible");
    }
  }
}
