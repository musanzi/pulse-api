import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { ProfileSkill } from '../../entities/profile-skill.entity';
import { RemoveSkillHandler } from '../handlers/remove-skill.handler';
import { RemoveSkillCommand } from '../impl/remove-skill.command';

const mockProfileRepo = () => ({ findOne: jest.fn() });
const mockSkillRepo   = () => ({ findOne: jest.fn(), remove: jest.fn() });

describe('RemoveSkillHandler', () => {
  let handler: RemoveSkillHandler;
  let profileRepo: ReturnType<typeof mockProfileRepo>;
  let skillRepo: ReturnType<typeof mockSkillRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveSkillHandler,
        { provide: getRepositoryToken(TalentProfile), useFactory: mockProfileRepo },
        { provide: getRepositoryToken(ProfileSkill),  useFactory: mockSkillRepo }
      ]
    }).compile();
    handler     = module.get(RemoveSkillHandler);
    profileRepo = module.get(getRepositoryToken(TalentProfile));
    skillRepo   = module.get(getRepositoryToken(ProfileSkill));
  });

  afterEach(() => jest.clearAllMocks());

  it('removes skill that belongs to the user profile', async () => {
    const profile = { id: 'p1', userId: 'u1', skills: [] };
    const skill   = { id: 's1', profileId: 'p1', name: 'nestjs' };
    profileRepo.findOne
      .mockResolvedValueOnce(profile)
      .mockResolvedValueOnce({ ...profile, skills: [] });
    skillRepo.findOne.mockResolvedValue(skill);
    skillRepo.remove.mockResolvedValue(skill);

    const result = await handler.execute(new RemoveSkillCommand('u1', 's1'));
    expect(skillRepo.remove).toHaveBeenCalledWith(skill);
    expect(result.skills).toHaveLength(0);
  });

  it('throws NotFoundException if skill belongs to a different profile', async () => {
    const profile = { id: 'p1', userId: 'u1' };
    profileRepo.findOne.mockResolvedValue(profile);
    skillRepo.findOne.mockResolvedValue(null); // not found for this profileId

    await expect(handler.execute(new RemoveSkillCommand('u1', 'other-skill'))).rejects.toThrow(NotFoundException);
  });
});
