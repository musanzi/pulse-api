import { Provider } from '@nestjs/common';
import { CreateQuestHandler } from './create-quest.handler';
import { UpdateQuestHandler } from './update-quest.handler';
import { DeleteQuestHandler } from './delete-quest.handler';

export const CommandHandlers: Provider[] = [CreateQuestHandler, UpdateQuestHandler, DeleteQuestHandler];
