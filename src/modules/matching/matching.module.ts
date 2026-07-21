import { Module } from '@nestjs/common';
import { QuestsModule } from '../quests/quests.module';
import { ApplicationsModule } from '../applications/applications.module';
import { OrganisationsModule } from '../organisations/organisations.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';

/**
 * Product Module 2 — AI Matching & Recommendation Engine.
 * OpenRouter-backed matching between talent profiles and opportunities.
 *
 * Groups the technical modules: Quests (the "opportunities" matched against),
 * Applications (carries the domain-specific data that feeds the engine),
 * Organisations (who posts the opportunities) and Intelligence (the engine itself).
 */
@Module({
  imports: [QuestsModule, ApplicationsModule, OrganisationsModule, IntelligenceModule]
})
export class MatchingModule {}
