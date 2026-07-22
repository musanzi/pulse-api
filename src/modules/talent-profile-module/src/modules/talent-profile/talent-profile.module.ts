import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';
import { TalentProfileController } from './controllers/talent-profile.controller';
import { TalentProfile } from './entities/talent-profile.entity';
import { ProfileSkill } from './entities/profile-skill.entity';
import {
  GetOrCreateProfileHandler,
  UpdateTalentProfileHandler,
  AddSkillHandler,
  AddSkillsBatchHandler,
  RemoveSkillHandler,
  GenerateCvHandler
} from './commands/handlers';


/**
 * Product Module 1 — Talent Profile Management.
 * Talent onboarding, profile creation, and data capture.
 *
 * Groups the technical modules: Users (built).
 * TODO: add SkillsModule and DocumentsModule when built.
 */
const CommandHandlers = [
  GetOrCreateProfileHandler,
  UpdateTalentProfileHandler,
  AddSkillHandler,
  AddSkillsBatchHandler,
  RemoveSkillHandler,
  GenerateCvHandler
];

/**
 * TalentProfileModule — Product Module 1: Talent Profile Management.
 *
 * Owns: TalentProfile entity, ProfileSkill entity, all profile CQRS handlers.
 * Auth:  AuthGuard + RolesGuard are APP_GUARD in AppModule — no @UseGuards needed here.
 * CQRS:  CqrsModule is already forRoot() in AppModule; importing it here gives
 *        this module access to CommandBus without re-initialising.
 */
@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([TalentProfile, ProfileSkill]),
    UsersModule
  ],
  controllers: [TalentProfileController],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers]
})
export class TalentProfileModule {}
