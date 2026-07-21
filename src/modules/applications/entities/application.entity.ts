import { AbstractEntity } from '@/modules/database/abstract.entity';
import { Quest } from '@/modules/quests/entities/quest.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ApplicationStatus } from '../enums';

@Entity()
@Unique(['userId', 'questId'])
export class Application extends AbstractEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  questId: string;

  // FK to Team — kept as a plain column until TeamsModule lands.
  @Column({ type: 'uuid', nullable: true })
  teamId: string;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  motivation: string;

  // Domain-specific answers, validated against the quest's domain on create.
  @Column({ type: 'json', nullable: true })
  domainDetails: Record<string, unknown>;

  // FK to Document — kept as a plain column until DocumentsModule lands.
  @Column({ type: 'uuid', nullable: true })
  cvDocumentId: string;

  @ManyToOne(() => Quest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questId' })
  quest: Quest;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
