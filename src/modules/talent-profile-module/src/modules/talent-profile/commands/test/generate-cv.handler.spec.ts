import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TalentProfile } from '../../entities/talent-profile.entity';
import { GenerateCvHandler } from '../handlers/generate-cv.handler';
import { GenerateCvCommand } from '../impl/generate-cv.command';

const mockRepo = () => ({ findOne: jest.fn() });

describe('GenerateCvHandler — fixes GN-021', () => {
  let handler: GenerateCvHandler;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateCvHandler,
        { provide: getRepositoryToken(TalentProfile), useFactory: mockRepo }
      ]
    }).compile();
    handler = module.get(GenerateCvHandler);
    repo    = module.get(getRepositoryToken(TalentProfile));
  });

  afterEach(() => jest.clearAllMocks());

  it('returns structured CV data when profile is complete enough', async () => {
    repo.findOne.mockResolvedValue({
      id: 'p1', userId: 'u1',
      firstName: 'Gold', lastName: 'Okereke',
      bio: 'Backend dev', phone: '+2348012345678',
      location: 'Abuja', portfolio: 'https://github.com/gold',
      avatarUrl: '', educationSummary: 'BSc CS',
      availability: 20, yearsExperience: 2,
      skills: [{ name: 'nestjs' }, { name: 'typescript' }, { name: 'postgresql' }]
    });

    const cv = await handler.execute(new GenerateCvCommand('u1'));

    expect(cv.summary).toBe('Backend dev');
    expect(cv.skills).toEqual(['nestjs', 'typescript', 'postgresql']);
    expect(cv.generatedAt).toBeDefined();
    expect(cv.personal.firstName).toBe('Gold');
  });

  it('throws BadRequestException when profile is too sparse — GN-021 fix', async () => {
    repo.findOne.mockResolvedValue({ id: 'p1', userId: 'u1', bio: null, skills: [] });
    await expect(handler.execute(new GenerateCvCommand('u1'))).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException when profile does not exist', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(handler.execute(new GenerateCvCommand('u1'))).rejects.toThrow(NotFoundException);
  });
});
