import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestsController } from './controllers/quests.controller';
import { Quest } from './entities/quest.entity';
import { QuestDeliverable } from './entities/quest-deliverable.entity';
import { QuestSkill } from './entities/quest-skill.entity';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Quest, QuestDeliverable, QuestSkill])],
  controllers: [QuestsController],
  providers: [...CommandHandlers, ...QueryHandlers]
})
export class QuestsModule {}
