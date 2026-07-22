import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { ProfileSkill } from '../../entities/profile-skill.entity';
import { AddSkillHandler } from '../handlers/add-skill.handler';
import { AddSkillCommand } from '../impl/add-skill.command';

const mockProfileRepo = () => ({ findOne: jest.fn() });
const mockSkillRepo   = () => ({ findOne: jest.fn(), create: jest.fn(), save: jest.fn() });

describe('AddSkillHandler', () => {
  let handler: AddSkillHandler;
  let profileRepo: ReturnType<typeof mockProfileRepo>;
  let skillRepo: ReturnType<typeof mockSkillRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddSkillHandler,
        { provide: getRepositoryToken(TalentProfile), useFactory: mockProfileRepo },
        { provide: getRepositoryToken(ProfileSkill),  useFactory: mockSkillRepo }
      ]
    }).compile();
    handler     = module.get(AddSkillHandler);
    profileRepo = module.get(getRepositoryToken(TalentProfile));
    skillRepo   = module.get(getRepositoryToken(ProfileSkill));
  });

  afterEach(() => jest.clearAllMocks());

  it('throws NotFoundException when profile does not exist', async () => {
    profileRepo.findOne.mockResolvedValue(null);
    await expect(handler.execute(new AddSkillCommand('u1', 'nestjs'))).rejects.toThrow(NotFoundException);
  });

  it('adds skill when it does not exist yet', async () => {
    const profile = { id: 'p1', userId: 'u1', skills: [] };
    profileRepo.findOne.mockResolvedValue(profile);
    skillRepo.findOne.mockResolvedValue(null);
    skillRepo.create.mockReturnValue({ profileId: 'p1', name: 'nestjs' });
    skillRepo.save.mockResolvedValue({});
    profileRepo.findOne.mockResolvedValueOnce(profile).mockResolvedValueOnce({ ...profile, skills: [{ name: 'nestjs' }] });

    const result = await handler.execute(new AddSkillCommand('u1', 'NestJS'));
    expect(skillRepo.create).toHaveBeenCalledWith({ profileId: 'p1', name: 'nestjs' }); // normalized
    expect(result.skills).toHaveLength(1);
  });

  it('silently skips duplicate skill — idempotent', async () => {
    const profile = { id: 'p1', userId: 'u1', skills: [{ name: 'nestjs' }] };
    profileRepo.findOne.mockResolvedValue(profile);
    skillRepo.findOne.mockResolvedValue({ name: 'nestjs' }); // already exists

    await handler.execute(new AddSkillCommand('u1', 'nestjs'));
    expect(skillRepo.create).not.toHaveBeenCalled();
    expect(skillRepo.save).not.toHaveBeenCalled();
  });
});
