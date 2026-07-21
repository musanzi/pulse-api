import { AbstractEntity } from '@/modules/database/abstract.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { RecommendationStatus, RecommendationType } from '../enums';
import { LearningPathStep } from './learning-path-step.entity';

/** A surfaced AI suggestion with its reasoning — the talent-facing career layer built on top of Match. */
@Entity()
export class Recommendation extends AbstractEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: RecommendationType })
  type: RecommendationType;

  @Column({ type: 'uuid', nullable: true })
  questId: string;

  // FK to TargetRole — kept as a plain column until SkillsModule lands.
  @Column({ type: 'uuid', nullable: true })
  targetRoleId: string;

  @Column({ type: 'float', nullable: true })
  score: number;

  // Why this was recommended — required, for transparency and fairness.
  @Column({ type: 'text' })
  reason: string;

  // Snapshot of the skills the talent was short on at the time of the recommendation.
  @Column({ type: 'json', nullable: true })
  skillGaps: Record<string, unknown>[];

  // Which model produced it — half of the feedback -> improvement loop.
  @Column({ type: 'varchar', length: 120 })
  modelVersion: string;

  @Column({ type: 'enum', enum: RecommendationStatus, default: RecommendationStatus.SUGGESTED })
  status: RecommendationStatus;

  @OneToMany(() => LearningPathStep, (step) => step.recommendation)
  steps: LearningPathStep[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
