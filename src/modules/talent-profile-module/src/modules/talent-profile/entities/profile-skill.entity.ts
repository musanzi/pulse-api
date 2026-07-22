import { AbstractEntity } from '@/modules/database/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TalentProfile } from './talent-profile.entity';

/**
 * ProfileSkill — normalized, individual skill row.
 * Unique constraint on (profileId + name) enforces de-duplication at DB level.
 * Fixes GN-010: comma-list counter bug — each skill is a real row, so counts are accurate.
 */
@Entity()
export class ProfileSkill extends AbstractEntity {
  @Column({ type: 'uuid' })
  profileId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToOne(() => TalentProfile, (profile) => profile.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: TalentProfile;
}
