import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { ProfileSkill } from '../../entities/profile-skill.entity';
import { AddSkillsBatchCommand } from '../impl';

@CommandHandler(AddSkillsBatchCommand)
export class AddSkillsBatchHandler implements ICommandHandler<AddSkillsBatchCommand, TalentProfile> {
  private readonly logger = new Logger(AddSkillsBatchHandler.name);

  constructor(
    @InjectRepository(TalentProfile)
    private readonly profileRepo: Repository<TalentProfile>,
    @InjectRepository(ProfileSkill)
    private readonly skillRepo: Repository<ProfileSkill>,
    private readonly dataSource: DataSource
  ) {}

  async execute({ userId, names }: AddSkillsBatchCommand): Promise<TalentProfile> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.dataSource.transaction(async (manager) => {
      for (const name of names) {
        const normalized = name.trim().toLowerCase();
        if (!normalized) continue;
        const exists = await manager.findOne(ProfileSkill, { where: { profileId: profile.id, name: normalized } });
        if (!exists) {
          await manager.save(manager.create(ProfileSkill, { profileId: profile.id, name: normalized }));
        }
      }
    });

    this.logger.log(`Batch added ${names.length} skills to profile ${profile.id}`);
    return this.profileRepo.findOne({ where: { userId }, relations: ['skills'] });
  }
}
