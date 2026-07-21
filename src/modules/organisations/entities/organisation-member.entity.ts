import { AbstractEntity } from '@/modules/database/abstract.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { OrgMemberRole } from '../enums';
import { Organisation } from './organisation.entity';

@Entity()
@Unique(['userId', 'organisationId'])
export class OrganisationMember extends AbstractEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  organisationId: string;

  @Column({ type: 'enum', enum: OrgMemberRole })
  memberRole: OrgMemberRole;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  joinedAt: Date;

  @ManyToOne(() => Organisation, (organisation) => organisation.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organisationId' })
  organisation: Organisation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
