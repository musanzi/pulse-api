import { AbstractEntity } from '@/modules/database/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Quest } from './quest.entity';

@Entity()
export class QuestDeliverable extends AbstractEntity {
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  required: boolean;

  @Column({ type: 'uuid' })
  questId: string;

  @ManyToOne(() => Quest, (quest) => quest.deliverables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questId' })
  quest: Quest;
}
