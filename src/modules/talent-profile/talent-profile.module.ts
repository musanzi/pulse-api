import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';

/**
 * Product Module 1 — Talent Profile Management.
 * Talent onboarding, profile creation, and data capture.
 *
 * Groups the technical modules: Users (built).
 * TODO: add SkillsModule and DocumentsModule when built.
 */
@Module({
  imports: [UsersModule]
})
export class TalentProfileModule {}
