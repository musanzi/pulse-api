import { Provider } from '@nestjs/common';
import { CreateQuestHandler } from './create-quest.handler';
import { UpdateQuestHandler } from './update-quest.handler';
import { DeleteQuestHandler } from './delete-quest.handler';
import { PublishQuestHandler } from './publish-quest.handler';
import { UnpublishQuestHandler } from './unpublish-quest.handler';
import { AddQuestDeliverableHandler } from './add-quest-deliverable.handler';
import { RemoveQuestDeliverableHandler } from './remove-quest-deliverable.handler';
import { AddQuestSkillHandler } from './add-quest-skill.handler';
import { RemoveQuestSkillHandler } from './remove-quest-skill.handler';

export const CommandHandlers: Provider[] = [
  CreateQuestHandler,
  UpdateQuestHandler,
  DeleteQuestHandler,
  PublishQuestHandler,
  UnpublishQuestHandler,
  AddQuestDeliverableHandler,
  RemoveQuestDeliverableHandler,
  AddQuestSkillHandler,
  RemoveQuestSkillHandler
];
