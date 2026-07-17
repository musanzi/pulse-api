import { AbstractEntity } from '@/modules/database/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { QuestDomain, QuestLevel, QuestStatus } from '../enums';
import { QuestDeliverable } from './quest-deliverable.entity';
import { QuestSkill } from './quest-skill.entity';

@Entity()
export class Quest extends AbstractEntity {
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: QuestDomain })
  domain: QuestDomain;

  @Column({ type: 'enum', enum: QuestLevel, nullable: true })
  level: QuestLevel;

  @Column({ type: 'int', nullable: true })
  durationDays: number;

  @Column({ type: 'enum', enum: QuestStatus, default: QuestStatus.DRAFT })
  status: QuestStatus;

  // FK to Organisation — kept as a plain column until OrganisationsModule lands.
  @Column({ type: 'uuid' })
  organisationId: string;

  // Authoring member — populated from the authenticated user on create.
  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @OneToMany(() => QuestDeliverable, (deliverable) => deliverable.quest)
  deliverables: QuestDeliverable[];

  @OneToMany(() => QuestSkill, (skill) => skill.quest)
  skills: QuestSkill[];
}
