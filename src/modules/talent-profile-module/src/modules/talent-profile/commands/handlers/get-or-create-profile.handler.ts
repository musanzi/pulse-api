import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { GetOrCreateProfileCommand } from '../impl';

@CommandHandler(GetOrCreateProfileCommand)
export class GetOrCreateProfileHandler implements ICommandHandler<GetOrCreateProfileCommand, TalentProfile> {
  private readonly logger = new Logger(GetOrCreateProfileHandler.name);

  constructor(
    @InjectRepository(TalentProfile)
    private readonly repository: Repository<TalentProfile>
  ) {}

  async execute({ userId }: GetOrCreateProfileCommand): Promise<TalentProfile> {
    let profile = await this.repository.findOne({ where: { userId }, relations: ['skills'] });

    if (!profile) {
      profile = await this.repository.save(this.repository.create({ userId }));
      this.logger.log(`Created TalentProfile for user ${userId}`);
    }

    return profile;
  }
}
