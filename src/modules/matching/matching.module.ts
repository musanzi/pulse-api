import { Module } from '@nestjs/common';
import { QuestsModule } from '../quests/quests.module';

/**
 * Product Module 2 — AI Matching & Recommendation Engine.
 * OpenRouter-backed matching between talent profiles and opportunities.
 *
 * Groups the technical modules: Quests (built — the "opportunities" matched against).
 * TODO: add ApplicationsModule, OrganisationsModule and IntelligenceModule when built.
 */
@Module({
  imports: [QuestsModule]
})
export class MatchingModule {}
