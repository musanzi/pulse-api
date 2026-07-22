import { BadRequestException, CommandHandler, ICommandHandler, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { UpdateTalentProfileCommand } from '../impl';

@CommandHandler(UpdateTalentProfileCommand)
export class UpdateTalentProfileHandler implements ICommandHandler<UpdateTalentProfileCommand, TalentProfile> {
  private readonly logger = new Logger(UpdateTalentProfileHandler.name);

  constructor(
    @InjectRepository(TalentProfile)
    private readonly repository: Repository<TalentProfile>
  ) {}

  async execute({ userId, dto }: UpdateTalentProfileCommand): Promise<TalentProfile> {
    try {
      let profile = await this.repository.findOne({ where: { userId }, relations: ['skills'] });

      if (!profile) {
        // Auto-create on first update (mirrors getOrCreate behaviour)
        profile = this.repository.create({ userId });
      }

      const updated = await this.repository.save(
        this.repository.merge(profile, {
          ...dto,
          isComplete: this.checkCompletion({ ...profile, ...dto } as TalentProfile)
        })
      );

      return this.repository.findOne({ where: { id: updated.id }, relations: ['skills'] });
    } catch (error) {
      this.logger.error(`Update profile failed userId="${userId}": ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Profile update failed');
    }
  }

  private checkCompletion(profile: Partial<TalentProfile>): boolean {
    return !!(profile.firstName && profile.lastName && profile.bio && profile.phone && profile.skills?.length >= 3);
  }
}
