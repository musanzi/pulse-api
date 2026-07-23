import { AbstractEntity } from '@/modules/database/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { LearningStepType } from '../enums';
import { Recommendation } from './recommendation.entity';

/**
 * One structured step towards closing a skill gap. Steps link to real quests rather than
 * living in a JSON blob, so completion can be tracked and the recommendation re-scored.
 */
@Entity()
export class LearningPathStep extends AbstractEntity {
  @Column({ type: 'uuid' })
  recommendationId: string;

  @Column({ type: 'int' })
  stepOrder: number;

  @Column({ type: 'enum', enum: LearningStepType })
  type: LearningStepType;

  @Column({ type: 'uuid', nullable: true })
  questId: string;

  // FK to Skill — kept as a plain column until SkillsModule lands.
  @Column({ type: 'uuid', nullable: true })
  skillId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @ManyToOne(() => Recommendation, (recommendation) => recommendation.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recommendationId' })
  recommendation: Recommendation;
}
