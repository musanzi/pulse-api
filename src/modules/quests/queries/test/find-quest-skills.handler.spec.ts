import { BadRequestException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { QuestSkill } from '../../entities/quest-skill.entity';
import { FindQuestSkillsQuery } from '../impl';
import { FindQuestSkillsHandler } from '../handlers/find-quest-skills.handler';

describe('FindQuestSkillsHandler', () => {
  let repository: jest.Mocked<Pick<Repository<QuestSkill>, 'find'>>;
  let handler: FindQuestSkillsHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const questId = 'quest-id';
  const skills = [{ id: 'quest-skill-id', questId }] as QuestSkill[];

  beforeEach(() => {
    repository = { find: jest.fn() };
    handler = new FindQuestSkillsHandler(mockDependency<Repository<QuestSkill>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns the required skills for a quest ordered by creation', async () => {
    repository.find.mockResolvedValueOnce(skills);

    const result = await handler.execute(new FindQuestSkillsQuery(questId));

    expect(result).toBe(skills);
    expect(repository.find).toHaveBeenCalledWith({ where: { questId }, order: { createdAt: 'ASC' } });
  });

  it('throws BadRequestException when skills cannot be found', async () => {
    repository.find.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new FindQuestSkillsQuery(questId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Compétences introuvables');
  });
});
