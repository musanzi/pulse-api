import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationMember } from '../../entities/organisation-member.entity';
import { OrgMemberRole } from '../../enums';
import { RemoveOrganisationMemberCommand } from '../impl';

@CommandHandler(RemoveOrganisationMemberCommand)
export class RemoveOrganisationMemberHandler implements ICommandHandler<RemoveOrganisationMemberCommand, void> {
  private readonly logger = new Logger(RemoveOrganisationMemberHandler.name);

  constructor(
    @InjectRepository(OrganisationMember)
    private readonly repository: Repository<OrganisationMember>
  ) {}

  async execute(command: RemoveOrganisationMemberCommand): Promise<void> {
    const { organisationId, memberId } = command;

    try {
      const member = await this.repository.findOne({ where: { id: memberId, organisationId } });

      if (!member) {
        throw new NotFoundException('Membre introuvable');
      }

      // An organisation must always keep at least one owner, otherwise nobody can manage it.
      if (member.memberRole === OrgMemberRole.OWNER) {
        const ownerCount = await this.repository.count({
          where: { organisationId, memberRole: OrgMemberRole.OWNER }
        });

        if (ownerCount <= 1) {
          throw new BadRequestException('Une organisation doit conserver au moins un propriétaire');
        }
      }

      await this.repository.delete(memberId);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;

      this.logger.error(
        `Remove organisation member failed id="${memberId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Suppression du membre impossible');
    }
  }
}
