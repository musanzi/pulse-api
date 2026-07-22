import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { ProfileSkill } from '../../entities/profile-skill.entity';
import { RemoveSkillCommand } from '../impl';

@CommandHandler(RemoveSkillCommand)
export class RemoveSkillHandler implements ICommandHandler<RemoveSkillCommand, TalentProfile> {
  private readonly logger = new Logger(RemoveSkillHandler.name);

  constructor(
    @InjectRepository(TalentProfile)
    private readonly profileRepo: Repository<TalentProfile>,
    @InjectRepository(ProfileSkill)
    private readonly skillRepo: Repository<ProfileSkill>
  ) {}

  async execute({ userId, skillId }: RemoveSkillCommand): Promise<TalentProfile> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const skill = await this.skillRepo.findOne({ where: { id: skillId, profileId: profile.id } });
    if (!skill) throw new NotFoundException('Skill not found or does not belong to your profile');

    await this.skillRepo.remove(skill);
    this.logger.log(`Removed skill ${skillId} from profile ${profile.id}`);

    return this.profileRepo.findOne({ where: { userId }, relations: ['skills'] });
  }
}
