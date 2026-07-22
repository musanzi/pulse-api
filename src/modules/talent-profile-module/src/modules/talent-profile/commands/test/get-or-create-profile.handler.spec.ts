import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { GetOrCreateProfileHandler } from '../handlers/get-or-create-profile.handler';
import { GetOrCreateProfileCommand } from '../impl/get-or-create-profile.command';

const mockRepo = () => ({ findOne: jest.fn(), create: jest.fn(), save: jest.fn() });

describe('GetOrCreateProfileHandler', () => {
  let handler: GetOrCreateProfileHandler;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrCreateProfileHandler,
        { provide: getRepositoryToken(TalentProfile), useFactory: mockRepo }
      ]
    }).compile();
    handler = module.get(GetOrCreateProfileHandler);
    repo = module.get(getRepositoryToken(TalentProfile));
  });

  afterEach(() => jest.clearAllMocks());

  it('returns existing profile when found', async () => {
    const profile = { id: 'p1', userId: 'u1', skills: [] };
    repo.findOne.mockResolvedValue(profile);
    const result = await handler.execute(new GetOrCreateProfileCommand('u1'));
    expect(result).toEqual(profile);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('creates and returns new profile when none exists', async () => {
    const newProfile = { id: 'p1', userId: 'u1', skills: [] };
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue(newProfile);
    repo.save.mockResolvedValue(newProfile);
    const result = await handler.execute(new GetOrCreateProfileCommand('u1'));
    expect(repo.create).toHaveBeenCalledWith({ userId: 'u1' });
    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual(newProfile);
  });
});
