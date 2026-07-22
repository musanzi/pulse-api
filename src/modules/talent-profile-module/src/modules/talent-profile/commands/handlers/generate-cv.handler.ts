import { BadRequestException, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { GenerateCvCommand } from '../impl';
import { ICvData } from '../../interfaces';

const MIN_SKILLS = 3;

/**
 * Fixes GN-021: Base44 generated an empty PDF regardless of profile data.
 * This handler throws 400 with a descriptive message if the profile is too
 * sparse, and returns a fully populated data object when it's not.
 */
@CommandHandler(GenerateCvCommand)
export class GenerateCvHandler implements ICommandHandler<GenerateCvCommand, ICvData> {
  constructor(
    @InjectRepository(TalentProfile)
    private readonly profileRepo: Repository<TalentProfile>
  ) {}

  async execute({ userId }: GenerateCvCommand): Promise<ICvData> {
    const profile = await this.profileRepo.findOne({ where: { userId }, relations: ['skills'] });
    if (!profile) throw new NotFoundException('Profile not found');

    if (!profile.bio && profile.skills.length < MIN_SKILLS) {
      throw new BadRequestException(
        `Your profile needs a bio and at least ${MIN_SKILLS} skills to generate a CV. ` +
          `You currently have ${profile.skills.length} skill(s).`
      );
    }

    return {
      generatedAt: new Date().toISOString(),
      personal: {
        firstName: profile.firstName ?? '',
        lastName:  profile.lastName  ?? '',
        phone:     profile.phone     ?? '',
        location:  profile.location  ?? '',
        portfolio: profile.portfolio ?? '',
        avatarUrl: profile.avatarUrl ?? ''
      },
      summary:         profile.bio              ?? '',
      education:       profile.educationSummary ?? '',
      availability:    profile.availability     ?? 0,
      yearsExperience: profile.yearsExperience  ?? 0,
      skills:          profile.skills.map((s) => s.name),
      achievements: [], // Sprint 2: populated from Achievement entity
      projects:     []  // Sprint 2: populated from Submission entity
    };
  }
}
