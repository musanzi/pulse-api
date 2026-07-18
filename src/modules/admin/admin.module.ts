import { Module } from '@nestjs/common';
import { StatsModule } from '../stats/stats.module';

/**
 * Product Module 4 — Admin & Analytics Dashboard.
 * Program oversight, usage metrics, and reporting for administrators.
 *
 * Groups the technical modules: Stats (built).
 * TODO: add AchievementsModule, NotificationsModule and analytics/audit when built.
 */
@Module({
  imports: [StatsModule]
})
export class AdminModule {}
