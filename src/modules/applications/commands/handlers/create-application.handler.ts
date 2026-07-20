import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestStatus } from '@/modules/quests/enums';
import { FindQuestByIdQuery } from '@/modules/quests/queries';
import { Application } from '../../entities/application.entity';
import { validateDomainDetails } from '../../helpers';
import { CreateApplicationCommand } from '../impl';

@CommandHandler(CreateApplicationCommand)
export class CreateApplicationHandler implements ICommandHandler<CreateApplicationCommand, Application> {
  private readonly logger = new Logger(CreateApplicationHandler.name);

  constructor(
    @InjectRepository(Application)
    private readonly repository: Repository<Application>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: CreateApplicationCommand): Promise<Application> {
    const { dto, userId } = command;
    const { questId, domainDetails } = dto;

    try {
      const quest = await this.queryBus.execute(new FindQuestByIdQuery(questId));

      if (quest.status !== QuestStatus.OPEN) {
        throw new BadRequestException("Cette quête n'accepte pas de candidatures");
      }

      const existingApplication = await this.repository.findOne({ where: { questId, userId } });

      if (existingApplication) {
        throw new ConflictException('Vous avez déjà postulé à cette quête');
      }

      await validateDomainDetails(quest.domain, domainDetails);

      return await this.repository.save(this.repository.create({ ...dto, userId }));
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Create application failed questId="${questId}" userId="${userId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Candidature impossible');
    }
  }
}
