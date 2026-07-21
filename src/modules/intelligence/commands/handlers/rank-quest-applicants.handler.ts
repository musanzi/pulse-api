import { BadRequestException, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '@/modules/applications/entities/application.entity';
import { FindApplicationsQuery } from '@/modules/applications/queries';
import { Quest } from '@/modules/quests/entities/quest.entity';
import { FindQuestByIdQuery } from '@/modules/quests/queries';
import { Match } from '../../entities/match.entity';
import { buildMatchPrompt, MATCH_SYSTEM_PROMPT } from '../../helpers';
import { IAiMatchResponse } from '../../interfaces';
import { OpenRouterService } from '../../services/openrouter.service';
import { RankQuestApplicantsCommand } from '../impl';

@CommandHandler(RankQuestApplicantsCommand)
export class RankQuestApplicantsHandler implements ICommandHandler<RankQuestApplicantsCommand, Match[]> {
  private readonly logger = new Logger(RankQuestApplicantsHandler.name);

  constructor(
    @InjectRepository(Match)
    private readonly repository: Repository<Match>,
    private readonly queryBus: QueryBus,
    private readonly openRouterService: OpenRouterService
  ) {}

  async execute(command: RankQuestApplicantsCommand): Promise<Match[]> {
    const { questId } = command;

    try {
      const quest: Quest = await this.queryBus.execute(new FindQuestByIdQuery(questId));
      const [applications]: [Application[], number] = await this.queryBus.execute(
        new FindApplicationsQuery({ questId })
      );

      if (applications.length === 0) return [];

      const result = await this.openRouterService.completeJson<IAiMatchResponse>(
        MATCH_SYSTEM_PROMPT,
        buildMatchPrompt(quest, applications)
      );

      const applicantIds = new Set(applications.map((application) => application.userId));
      // Only keep scores for candidates who actually applied — the model can hallucinate ids.
      const scored = (result.matches ?? []).filter((match) => applicantIds.has(match.userId));

      if (scored.length === 0) return [];

      const existing = await this.repository.find({ where: { questId } });
      const existingByUser = new Map(existing.map((match) => [match.userId, match]));

      const matches = scored.map((match) =>
        this.repository.create({
          ...(existingByUser.get(match.userId) ?? {}),
          userId: match.userId,
          questId,
          score: Math.min(Math.max(Number(match.score) || 0, 0), 100) / 100,
          explanation: match.reasoning,
          method: this.openRouterService.model,
          computedAt: new Date()
        })
      );

      return await this.repository.save(matches);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ServiceUnavailableException) throw error;

      this.logger.error(
        `Rank quest applicants failed questId="${questId}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Classement des candidatures impossible');
    }
  }
}
