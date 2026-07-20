import { Module } from '@nestjs/common';
import { QuestsModule } from '../quests/quests.module';
import { ApplicationsModule } from '../applications/applications.module';

/**
 * Product Module 2 — AI Matching & Recommendation Engine.
 * OpenRouter-backed matching between talent profiles and opportunities.
 *
 * Groups the technical modules: Quests (the "opportunities" matched against),
 * Applications (carries the domain-specific data that feeds the engine).
 * TODO: add OrganisationsModule and IntelligenceModule when built.
 */
@Module({
  imports: [QuestsModule, ApplicationsModule]
})
export class MatchingModule {}
