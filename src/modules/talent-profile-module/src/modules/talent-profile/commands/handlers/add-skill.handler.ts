import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { ProfileSkill } from '../../entities/profile-skill.entity';
import { AddSkillCommand } from '../impl';

@CommandHandler(AddSkillCommand)
export class AddSkillHandler implements ICommandHandler<AddSkillCommand, TalentProfile> {
  private readonly logger = new Logger(AddSkillHandler.name);

  constructor(
    @InjectRepository(TalentProfile)
    private readonly profileRepo: Repository<TalentProfile>,
    @InjectRepository(ProfileSkill)
    private readonly skillRepo: Repository<ProfileSkill>
  ) {}

  async execute({ userId, name }: AddSkillCommand): Promise<TalentProfile> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const normalized = name.trim().toLowerCase();
    const exists = await this.skillRepo.findOne({ where: { profileId: profile.id, name: normalized } });

    if (!exists) {
      await this.skillRepo.save(this.skillRepo.create({ profileId: profile.id, name: normalized }));
      this.logger.log(`Added skill "${normalized}" to profile ${profile.id}`);
    }

    return this.profileRepo.findOne({ where: { userId }, relations: ['skills'] });
  }
}
