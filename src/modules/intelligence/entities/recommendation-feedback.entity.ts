import { AbstractEntity } from '@/modules/database/abstract.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { FeedbackType } from '../enums';
import { Recommendation } from './recommendation.entity';

/** The loop that improves the model: paired with Recommendation.modelVersion, this is the training signal. */
@Entity()
export class RecommendationFeedback extends AbstractEntity {
  @Column({ type: 'uuid' })
  recommendationId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: FeedbackType })
  feedbackType: FeedbackType;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => Recommendation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recommendationId' })
  recommendation: Recommendation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
