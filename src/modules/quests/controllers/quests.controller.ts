import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';
import { CreateQuestDeliverableDto } from '../dto/create-quest-deliverable.dto';
import { CreateQuestSkillDto } from '../dto/create-quest-skill.dto';
import { IFilterQuests } from '../interfaces';
import { Quest } from '../entities/quest.entity';
import { QuestDeliverable } from '../entities/quest-deliverable.entity';
import { QuestSkill } from '../entities/quest-skill.entity';
import { CurrentUser, Roles } from '@/modules/auth/decorators';
import { RoleEnum } from '@/modules/auth/enums';
import {
  AddQuestDeliverableCommand,
  AddQuestSkillCommand,
  CreateQuestCommand,
  DeleteQuestCommand,
  PublishQuestCommand,
  RemoveQuestDeliverableCommand,
  RemoveQuestSkillCommand,
  UnpublishQuestCommand,
  UpdateQuestCommand
} from '../commands';
import { FindQuestByIdQuery, FindQuestDeliverablesQuery, FindQuestSkillsQuery, FindQuestsQuery } from '../queries';

// NOTE: write routes are @Roles([ADMIN]) for now; widen to [ORGANISATION, ADMIN] once the DigiPulse roles land.
@Controller('quests')
export class QuestsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // ----- Quests (marketplace browsing is open to any authenticated user) -----

  @Get()
  findAll(@Query() query: IFilterQuests): Promise<[Quest[], number]> {
    return this.queryBus.execute(new FindQuestsQuery(query));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Quest> {
    return this.queryBus.execute(new FindQuestByIdQuery(id));
  }

  @Post()
  @Roles([RoleEnum.ADMIN])
  create(@CurrentUser('id') createdById: string, @Body() dto: CreateQuestDto): Promise<Quest> {
    return this.commandBus.execute(new CreateQuestCommand(dto, createdById));
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

  @Post(':id/publish')
  @Roles([RoleEnum.ADMIN])
  publish(@Param('id') id: string): Promise<Quest> {
    return this.commandBus.execute(new PublishQuestCommand(id));
  }

  @Post(':id/unpublish')
  @Roles([RoleEnum.ADMIN])
  unpublish(@Param('id') id: string): Promise<Quest> {
    return this.commandBus.execute(new UnpublishQuestCommand(id));
  }

  // ----- Deliverables (sub-resource of a quest) -----

  @Get(':questId/deliverables')
  findDeliverables(@Param('questId') questId: string): Promise<QuestDeliverable[]> {
    return this.queryBus.execute(new FindQuestDeliverablesQuery(questId));
  }

  @Post(':questId/deliverables')
  @Roles([RoleEnum.ADMIN])
  addDeliverable(
    @Param('questId') questId: string,
    @Body() dto: CreateQuestDeliverableDto
  ): Promise<QuestDeliverable> {
    return this.commandBus.execute(new AddQuestDeliverableCommand(questId, dto));
  }

  @Delete(':questId/deliverables/:deliverableId')
  @Roles([RoleEnum.ADMIN])
  removeDeliverable(
    @Param('questId') questId: string,
    @Param('deliverableId') deliverableId: string
  ): Promise<void> {
    return this.commandBus.execute(new RemoveQuestDeliverableCommand(questId, deliverableId));
  }

  // ----- Required skills (sub-resource of a quest) -----

  @Get(':questId/skills')
  findSkills(@Param('questId') questId: string): Promise<QuestSkill[]> {
    return this.queryBus.execute(new FindQuestSkillsQuery(questId));
  }

  @Post(':questId/skills')
  @Roles([RoleEnum.ADMIN])
  addSkill(@Param('questId') questId: string, @Body() dto: CreateQuestSkillDto): Promise<QuestSkill> {
    return this.commandBus.execute(new AddQuestSkillCommand(questId, dto));
  }

  @Delete(':questId/skills/:questSkillId')
  @Roles([RoleEnum.ADMIN])
  removeSkill(@Param('questId') questId: string, @Param('questSkillId') questSkillId: string): Promise<void> {
    return this.commandBus.execute(new RemoveQuestSkillCommand(questId, questSkillId));
  }
}
