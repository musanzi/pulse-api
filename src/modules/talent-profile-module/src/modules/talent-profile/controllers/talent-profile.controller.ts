import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUser } from '@/modules/auth/decorators';
import { UpdateTalentProfileDto } from '../dto/update-talent-profile.dto';
import { AddSkillDto, AddSkillsBatchDto } from '../dto/add-skill.dto';
import {
  GetOrCreateProfileCommand,
  UpdateTalentProfileCommand,
  AddSkillCommand,
  AddSkillsBatchCommand,
  RemoveSkillCommand,
  GenerateCvCommand
} from '../commands';

/**
 * No @UseGuards needed — AuthGuard is registered as APP_GUARD in AppModule
 * and protects every route by default. Use @Public() to opt out.
 */
@Controller('talent-profile')
export class TalentProfileController {
  constructor(private readonly commandBus: CommandBus) {}

  /** GET /talent-profile/me
   *  Returns own profile. Creates an empty one on first visit — no 404.
   *  Fixes BUG-002: ensures a profile always exists before the frontend tries to render it.
   */
  @Get('me')
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.commandBus.execute(new GetOrCreateProfileCommand(userId));
  }

  /** PATCH /talent-profile/me — update profile fields */
  @Patch('me')
  updateMyProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateTalentProfileDto) {
    return this.commandBus.execute(new UpdateTalentProfileCommand(userId, dto));
  }

  /** POST /talent-profile/skills — add a single skill (idempotent) */
  @Post('skills')
  @HttpCode(HttpStatus.OK)
  addSkill(@CurrentUser('id') userId: string, @Body() dto: AddSkillDto) {
    return this.commandBus.execute(new AddSkillCommand(userId, dto.name));
  }

  /** POST /talent-profile/skills/batch
   *  Add multiple skills at once.
   *  Fixes GN-010: frontend parses comma-separated input and sends names[] here.
   */
  @Post('skills/batch')
  @HttpCode(HttpStatus.OK)
  addSkillsBatch(@CurrentUser('id') userId: string, @Body() dto: AddSkillsBatchDto) {
    return this.commandBus.execute(new AddSkillsBatchCommand(userId, dto.names));
  }

  /** DELETE /talent-profile/skills/:skillId */
  @Delete('skills/:skillId')
  removeSkill(@CurrentUser('id') userId: string, @Param('skillId', ParseUUIDPipe) skillId: string) {
    return this.commandBus.execute(new RemoveSkillCommand(userId, skillId));
  }

  /** GET /talent-profile/cv
   *  Generate CV data. Throws 400 with a clear message if profile is too sparse.
   *  Fixes GN-021: Base44 generated an empty PDF regardless of data.
   */
  @Get('cv')
  generateCv(@CurrentUser('id') userId: string) {
    return this.commandBus.execute(new GenerateCvCommand(userId));
  }
}
