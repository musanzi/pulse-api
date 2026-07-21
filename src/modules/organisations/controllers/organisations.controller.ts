import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, Roles } from '@/modules/auth/decorators';
import { RoleEnum } from '@/modules/auth/enums';
import { CreateOrganisationDto } from '../dto/create-organisation.dto';
import { UpdateOrganisationDto } from '../dto/update-organisation.dto';
import { AddOrganisationMemberDto } from '../dto/add-organisation-member.dto';
import { Organisation } from '../entities/organisation.entity';
import { OrganisationMember } from '../entities/organisation-member.entity';
import { IFilterOrganisations } from '../interfaces';
import {
  AddOrganisationMemberCommand,
  CreateOrganisationCommand,
  DeleteOrganisationCommand,
  RemoveOrganisationMemberCommand,
  UpdateOrganisationCommand
} from '../commands';
import { FindOrganisationByIdQuery, FindOrganisationMembersQuery, FindOrganisationsQuery } from '../queries';

// NOTE: management routes are @Roles([ADMIN]) for now; replace with an owner/org-member guard
// once the DigiPulse roles and OrgMemberGuard land.
@Controller('organisations')
export class OrganisationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // ----- Organisations (browsing is open to any authenticated user) -----

  @Get()
  findAll(@Query() query: IFilterOrganisations): Promise<[Organisation[], number]> {
    return this.queryBus.execute(new FindOrganisationsQuery(query));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Organisation> {
    return this.queryBus.execute(new FindOrganisationByIdQuery(id));
  }

  // Any authenticated user may create an organisation and becomes its first OWNER.
  @Post()
  create(@CurrentUser('id') ownerId: string, @Body() dto: CreateOrganisationDto): Promise<Organisation> {
    return this.commandBus.execute(new CreateOrganisationCommand(dto, ownerId));
  }

  @Patch(':id')
  @Roles([RoleEnum.ADMIN])
  update(@Param('id') id: string, @Body() dto: UpdateOrganisationDto): Promise<Organisation> {
    return this.commandBus.execute(new UpdateOrganisationCommand(id, dto));
  }

  @Delete(':id')
  @Roles([RoleEnum.ADMIN])
  remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteOrganisationCommand(id));
  }

  // ----- Members (sub-resource of an organisation) -----

  @Get(':organisationId/members')
  findMembers(@Param('organisationId') organisationId: string): Promise<OrganisationMember[]> {
    return this.queryBus.execute(new FindOrganisationMembersQuery(organisationId));
  }

  @Post(':organisationId/members')
  @Roles([RoleEnum.ADMIN])
  addMember(
    @Param('organisationId') organisationId: string,
    @Body() dto: AddOrganisationMemberDto
  ): Promise<OrganisationMember> {
    return this.commandBus.execute(new AddOrganisationMemberCommand(organisationId, dto));
  }

  @Delete(':organisationId/members/:memberId')
  @Roles([RoleEnum.ADMIN])
  removeMember(
    @Param('organisationId') organisationId: string,
    @Param('memberId') memberId: string
  ): Promise<void> {
    return this.commandBus.execute(new RemoveOrganisationMemberCommand(organisationId, memberId));
  }
}
