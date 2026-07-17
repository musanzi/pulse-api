import { Provider } from '@nestjs/common';
import { FindQuestsHandler } from './find-quests.handler';
import { FindQuestByIdHandler } from './find-quest-by-id.handler';

export const QueryHandlers: Provider[] = [FindQuestsHandler, FindQuestByIdHandler];
