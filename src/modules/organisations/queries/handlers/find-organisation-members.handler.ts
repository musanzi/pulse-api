import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationMember } from '../../entities/organisation-member.entity';
import { FindOrganisationMembersQuery } from '../impl';

@QueryHandler(FindOrganisationMembersQuery)
export class FindOrganisationMembersHandler
  implements IQueryHandler<FindOrganisationMembersQuery, OrganisationMember[]>
{
  private readonly logger = new Logger(FindOrganisationMembersHandler.name);

  constructor(
    @InjectRepository(OrganisationMember)
    private readonly repository: Repository<OrganisationMember>
  ) {}

  async execute(query: FindOrganisationMembersQuery): Promise<OrganisationMember[]> {
    try {
      return await this.repository.find({
        where: { organisationId: query.organisationId },
        order: { joinedAt: 'ASC' }
      });
    } catch (error) {
      this.logger.error(
        `Find organisation members failed organisationId="${query.organisationId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Membres introuvables');
    }
  }
}
