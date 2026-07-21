import { BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Organisation } from '../../entities/organisation.entity';
import { OrganisationMember } from '../../entities/organisation-member.entity';
import { OrgMemberRole } from '../../enums';
import { CreateOrganisationCommand } from '../impl';
import { CreateOrganisationHandler } from '../handlers/create-organisation.handler';

describe('CreateOrganisationHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Organisation>, 'findOne' | 'create' | 'save'>>;
  let memberRepository: jest.Mocked<Pick<Repository<OrganisationMember>, 'create' | 'save'>>;
  let handler: CreateOrganisationHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const ownerId = 'user-id';
  const dto = { name: 'Cinolu Group', sector: 'Tech' };
  const organisation = { id: 'organisation-id', ...dto, slug: 'cinolu-group' } as Organisation;
  const member = { id: 'member-id' } as OrganisationMember;

  beforeEach(() => {
    repository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    memberRepository = { create: jest.fn(), save: jest.fn() };
    handler = new CreateOrganisationHandler(
      mockDependency<Repository<Organisation>>(repository),
      mockDependency<Repository<OrganisationMember>>(memberRepository)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('creates the organisation with a slug derived from the name', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(organisation);
    repository.save.mockResolvedValueOnce(organisation);
    memberRepository.create.mockReturnValueOnce(member);
    memberRepository.save.mockResolvedValueOnce(member);

    const result = await handler.execute(new CreateOrganisationCommand(dto, ownerId));

    expect(result).toBe(organisation);
    expect(repository.create).toHaveBeenCalledWith({ ...dto, slug: 'cinolu-group' });
  });

  it('makes the creator the first OWNER', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(organisation);
    repository.save.mockResolvedValueOnce(organisation);
    memberRepository.create.mockReturnValueOnce(member);
    memberRepository.save.mockResolvedValueOnce(member);

    await handler.execute(new CreateOrganisationCommand(dto, ownerId));

    expect(memberRepository.create).toHaveBeenCalledWith({
      organisationId: 'organisation-id',
      userId: ownerId,
      memberRole: OrgMemberRole.OWNER
    });
    expect(memberRepository.save).toHaveBeenCalledWith(member);
  });

  it('throws ConflictException when the name is already taken', async () => {
    repository.findOne.mockResolvedValueOnce(organisation);
    const promise = handler.execute(new CreateOrganisationCommand(dto, ownerId));

    await expect(promise).rejects.toThrow(ConflictException);
    await expect(promise).rejects.toThrow('Cette organisation existe déjà');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when creation fails unexpectedly', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(organisation);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new CreateOrganisationCommand(dto, ownerId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow("Création de l'organisation impossible");
  });
});
