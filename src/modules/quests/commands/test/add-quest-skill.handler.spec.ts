import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Quest } from '../../entities/quest.entity';
import { QuestSkill } from '../../entities/quest-skill.entity';
import { SkillLevel } from '../../enums';
import { AddQuestSkillCommand } from '../impl';
import { AddQuestSkillHandler } from '../handlers/add-quest-skill.handler';

describe('AddQuestSkillHandler', () => {
  let repository: jest.Mocked<Pick<Repository<QuestSkill>, 'create' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: AddQuestSkillHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const questId = 'quest-id';
  const dto = { skillId: '22222222-2222-2222-2222-222222222222', requiredLevel: SkillLevel.INTERMEDIATE };
  const questSkill = { id: 'quest-skill-id', questId, ...dto } as QuestSkill;

  beforeEach(() => {
    repository = { create: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new AddQuestSkillHandler(
      mockDependency<Repository<QuestSkill>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('adds a required skill to an existing quest', async () => {
    queryBus.execute.mockResolvedValueOnce({ id: questId } as Quest);
    repository.create.mockReturnValueOnce(questSkill);
    repository.save.mockResolvedValueOnce(questSkill);

    const result = await handler.execute(new AddQuestSkillCommand(questId, dto));

    expect(result).toBe(questSkill);
    expect(repository.create).toHaveBeenCalledWith({ ...dto, questId });
  });

  it('throws NotFoundException unchanged when the quest does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Quête introuvable'));
    const promise = handler.execute(new AddQuestSkillCommand(questId, dto));

    await expect(promise).rejects.toThrow(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when adding the skill fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce({ id: questId } as Quest);
    repository.create.mockReturnValueOnce(questSkill);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new AddQuestSkillCommand(questId, dto));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Ajout de la compétence impossible');
  });
});
