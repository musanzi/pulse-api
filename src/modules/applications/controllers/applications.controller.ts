import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser, Roles } from '@/modules/auth/decorators';
import { RoleEnum } from '@/modules/auth/enums';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { Application } from '../entities/application.entity';
import { IFilterApplications } from '../interfaces';
import {
  AcceptApplicationCommand,
  CreateApplicationCommand,
  RejectApplicationCommand,
  WithdrawApplicationCommand
} from '../commands';
import { FindApplicationByIdQuery, FindApplicationsQuery } from '../queries';

// NOTE: accept/reject are @Roles([ADMIN]) for now; widen to [ORGANISATION, ADMIN] once the DigiPulse roles land.
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  apply(@CurrentUser('id') userId: string, @Body() dto: CreateApplicationDto): Promise<Application> {
    return this.commandBus.execute(new CreateApplicationCommand(dto, userId));
  }

  @Get('me')
  findMine(@CurrentUser('id') userId: string, @Query() query: IFilterApplications): Promise<[Application[], number]> {
    return this.queryBus.execute(new FindApplicationsQuery({ ...query, userId }));
  }

  @Get()
  @Roles([RoleEnum.ADMIN])
  findAll(@Query() query: IFilterApplications): Promise<[Application[], number]> {
    return this.queryBus.execute(new FindApplicationsQuery(query));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Application> {
    return this.queryBus.execute(new FindApplicationByIdQuery(id));
  }

  @Patch(':id/accept')
  @Roles([RoleEnum.ADMIN])
  accept(@Param('id') id: string): Promise<Application> {
    return this.commandBus.execute(new AcceptApplicationCommand(id));
  }

  @Patch(':id/reject')
  @Roles([RoleEnum.ADMIN])
  reject(@Param('id') id: string): Promise<Application> {
    return this.commandBus.execute(new RejectApplicationCommand(id));
  }

  @Patch(':id/withdraw')
  withdraw(@Param('id') id: string, @CurrentUser('id') userId: string): Promise<Application> {
    return this.commandBus.execute(new WithdrawApplicationCommand(id, userId));
  }
}
