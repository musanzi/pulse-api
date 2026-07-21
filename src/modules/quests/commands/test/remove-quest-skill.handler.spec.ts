import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { QuestSkill } from '../../entities/quest-skill.entity';
import { RemoveQuestSkillCommand } from '../impl';
import { RemoveQuestSkillHandler } from '../handlers/remove-quest-skill.handler';

describe('RemoveQuestSkillHandler', () => {
  let repository: jest.Mocked<Pick<Repository<QuestSkill>, 'findOne' | 'delete'>>;
  let handler: RemoveQuestSkillHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const questId = 'quest-id';
  const questSkillId = 'quest-skill-id';
  const questSkill = { id: questSkillId, questId } as QuestSkill;

  beforeEach(() => {
    repository = { findOne: jest.fn(), delete: jest.fn() };
    handler = new RemoveQuestSkillHandler(mockDependency<Repository<QuestSkill>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('removes a skill that belongs to the quest', async () => {
    repository.findOne.mockResolvedValueOnce(questSkill);
    repository.delete.mockResolvedValueOnce({ affected: 1, raw: [] } as DeleteResult);

    await handler.execute(new RemoveQuestSkillCommand(questId, questSkillId));

    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: questSkillId, questId } });
    expect(repository.delete).toHaveBeenCalledWith(questSkillId);
  });

  it('throws NotFoundException when the skill does not exist on the quest', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    const promise = handler.execute(new RemoveQuestSkillCommand(questId, questSkillId));

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Compétence introuvable');
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when the deletion fails unexpectedly', async () => {
    repository.findOne.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new RemoveQuestSkillCommand(questId, questSkillId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Suppression de la compétence impossible');
  });
});
