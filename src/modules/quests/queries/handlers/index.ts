import { Provider } from '@nestjs/common';
import { FindQuestsHandler } from './find-quests.handler';
import { FindQuestByIdHandler } from './find-quest-by-id.handler';
import { FindQuestDeliverablesHandler } from './find-quest-deliverables.handler';
import { FindQuestSkillsHandler } from './find-quest-skills.handler';

export const QueryHandlers: Provider[] = [
  FindQuestsHandler,
  FindQuestByIdHandler,
  FindQuestDeliverablesHandler,
  FindQuestSkillsHandler
];
