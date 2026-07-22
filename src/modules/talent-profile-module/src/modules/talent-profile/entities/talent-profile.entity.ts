import { AbstractEntity } from '@/modules/database/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProfileSkill } from './profile-skill.entity';

@Entity()
export class TalentProfile extends AbstractEntity {
  // FK to User — plain column to keep modules decoupled
  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  // GN-012: stored only after server-side @IsPhoneNumber validation
  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  educationSummary: string;

  // GN-014: validated 0–80 hrs/week
  @Column({ type: 'int', nullable: true })
  availability: number;

  @Column({ type: 'int', nullable: true })
  yearsExperience: number;

  // GN-013/BUG-004: stored only after @IsUrl http/https validation
  @Column({ type: 'varchar', length: 500, nullable: true })
  portfolio: string;

  @Column({ type: 'boolean', default: false })
  isComplete: boolean;

  @OneToMany(() => ProfileSkill, (skill) => skill.profile, { cascade: true, eager: true })
  skills: ProfileSkill[];
}
