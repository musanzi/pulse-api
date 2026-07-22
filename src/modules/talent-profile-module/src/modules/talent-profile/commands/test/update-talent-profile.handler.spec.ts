import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { UpdateTalentProfileHandler } from '../handlers/update-talent-profile.handler';
import { UpdateTalentProfileCommand } from '../impl/update-talent-profile.command';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn((a, b) => ({ ...a, ...b }))
});

describe('UpdateTalentProfileHandler', () => {
  let handler: UpdateTalentProfileHandler;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTalentProfileHandler,
        { provide: getRepositoryToken(TalentProfile), useFactory: mockRepo }
      ]
    }).compile();
    handler = module.get(UpdateTalentProfileHandler);
    repo = module.get(getRepositoryToken(TalentProfile));
  });

  afterEach(() => jest.clearAllMocks());

  it('merges dto fields and saves', async () => {
    const existing = { id: 'p1', userId: 'u1', bio: 'old bio', skills: [] };
    const updated = { ...existing, bio: 'new bio', isComplete: false };
    repo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);
    repo.save.mockResolvedValue(updated);

    const result = await handler.execute(new UpdateTalentProfileCommand('u1', { bio: 'new bio' }));
    expect(repo.save).toHaveBeenCalled();
    expect(result.bio).toBe('new bio');
  });

  it('sets isComplete true when all required fields present', async () => {
    const existing = {
      id: 'p1', userId: 'u1',
      firstName: 'Gold', lastName: 'Okereke',
      bio: 'Dev', phone: '+2348012345678',
      skills: [{ name: 'nestjs' }, { name: 'ts' }, { name: 'pg' }]
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (p) => p);

    await handler.execute(new UpdateTalentProfileCommand('u1', {}));
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ isComplete: true }));
  });

  it('sets isComplete false when profile is sparse', async () => {
    const existing = { id: 'p1', userId: 'u1', skills: [] };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (p) => p);

    await handler.execute(new UpdateTalentProfileCommand('u1', {}));
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ isComplete: false }));
  });
});
