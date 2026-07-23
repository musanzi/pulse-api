import { AbstractEntity } from '@/modules/database/abstract.entity';
import { Quest } from '@/modules/quests/entities/quest.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

/** One relevance score for a user <-> quest pair. The scoring primitive used to rank applicants. */
@Entity()
@Unique(['userId', 'questId'])
export class Match extends AbstractEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  questId: string;

  @Column({ type: 'float' })
  score: number;

  // Human-readable justification — kept so ranking is never a black box.
  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  method: string;

  @Column({ type: 'timestamptz', nullable: true })
  computedAt: Date;

  @ManyToOne(() => Quest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questId' })
  quest: Quest;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
