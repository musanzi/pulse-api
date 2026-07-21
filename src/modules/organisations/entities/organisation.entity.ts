import { AbstractEntity } from '@/modules/database/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { OrganisationMember } from './organisation-member.entity';

@Entity()
export class Organisation extends AbstractEntity {
  @Column({ type: 'varchar', length: 150, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 180, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sector: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  websiteUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl: string;

  @OneToMany(() => OrganisationMember, (member) => member.organisation)
  members: OrganisationMember[];
}
