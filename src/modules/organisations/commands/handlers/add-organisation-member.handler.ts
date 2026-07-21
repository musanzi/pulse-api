import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationMember } from '../../entities/organisation-member.entity';
import { FindOrganisationByIdQuery } from '../../queries';
import { AddOrganisationMemberCommand } from '../impl';

@CommandHandler(AddOrganisationMemberCommand)
export class AddOrganisationMemberHandler
  implements ICommandHandler<AddOrganisationMemberCommand, OrganisationMember>
{
  private readonly logger = new Logger(AddOrganisationMemberHandler.name);

  constructor(
    @InjectRepository(OrganisationMember)
    private readonly repository: Repository<OrganisationMember>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: AddOrganisationMemberCommand): Promise<OrganisationMember> {
    const { organisationId, dto } = command;

    try {
      await this.queryBus.execute(new FindOrganisationByIdQuery(organisationId));

      const existingMember = await this.repository.findOne({
        where: { organisationId, userId: dto.userId }
      });

      if (existingMember) {
        throw new ConflictException('Cet utilisateur est déjà membre de cette organisation');
      }

      return await this.repository.save(this.repository.create({ ...dto, organisationId }));
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;

      this.logger.error(
        `Add organisation member failed organisationId="${organisationId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Ajout du membre impossible');
    }
  }
}
