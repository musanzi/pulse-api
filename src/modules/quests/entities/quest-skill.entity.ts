import { AbstractEntity } from '@/modules/database/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SkillLevel } from '../enums';
import { Quest } from './quest.entity';

@Entity()
export class QuestSkill extends AbstractEntity {
  @Column({ type: 'uuid' })
  questId: string;

  // FK to Skill — kept as a plain column until SkillsModule lands.
  @Column({ type: 'uuid' })
  skillId: string;

  @Column({ type: 'enum', enum: SkillLevel, nullable: true })
  requiredLevel: SkillLevel;

  @ManyToOne(() => Quest, (quest) => quest.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questId' })
  quest: Quest;
}
