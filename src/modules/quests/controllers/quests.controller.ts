import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';
import { IFilterQuests } from '../interfaces';
import { Quest } from '../entities/quest.entity';
import { Roles } from '@/modules/auth/decorators';
import { RoleEnum } from '@/modules/auth/enums';
import { CreateQuestCommand, DeleteQuestCommand, UpdateQuestCommand } from '../commands';
import { FindQuestByIdQuery, FindQuestsQuery } from '../queries';

@Controller('quests')
export class QuestsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // Marketplace browsing is open to any authenticated user (global AuthGuard applies).
  @Get()
  findAll(@Query() query: IFilterQuests): Promise<[Quest[], number]> {
    return this.queryBus.execute(new FindQuestsQuery(query));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Quest> {
    return this.queryBus.execute(new FindQuestByIdQuery(id));
  }

  // TODO: widen to [RoleEnum.ORGANISATION, RoleEnum.ADMIN] once the DigiPulse roles land.
  @Post()
  @Roles([RoleEnum.ADMIN])
  create(@Body() dto: CreateQuestDto): Promise<Quest> {
    return this.commandBus.execute(new CreateQuestCommand(dto));
  }

  @Patch(':id')
  @Roles([RoleEnum.ADMIN])
  update(@Param('id') id: string, @Body() dto: UpdateQuestDto): Promise<Quest> {
    return this.commandBus.execute(new UpdateQuestCommand(id, dto));
  }

  @Delete(':id')
  @Roles([RoleEnum.ADMIN])
  remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteQuestCommand(id));
  }
}
