import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Organisation } from '../../entities/organisation.entity';
import { OrganisationMember } from '../../entities/organisation-member.entity';
import { OrgMemberRole } from '../../enums';
import { AddOrganisationMemberCommand } from '../impl';
import { AddOrganisationMemberHandler } from '../handlers/add-organisation-member.handler';

describe('AddOrganisationMemberHandler', () => {
  let repository: jest.Mocked<Pick<Repository<OrganisationMember>, 'findOne' | 'create' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: AddOrganisationMemberHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const organisationId = 'organisation-id';
  const dto = { userId: 'user-id', memberRole: OrgMemberRole.RECRUITER };
  const member = { id: 'member-id', organisationId, ...dto } as OrganisationMember;

  beforeEach(() => {
    repository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    queryBus = { execute: jest.fn() };
    handler = new AddOrganisationMemberHandler(
      mockDependency<Repository<OrganisationMember>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('adds a member to an existing organisation', async () => {
    queryBus.execute.mockResolvedValueOnce({ id: organisationId } as Organisation);
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(member);
    repository.save.mockResolvedValueOnce(member);

    const result = await handler.execute(new AddOrganisationMemberCommand(organisationId, dto));

    expect(result).toBe(member);
    expect(repository.create).toHaveBeenCalledWith({ ...dto, organisationId });
  });

  it('throws ConflictException when the user is already a member', async () => {
    queryBus.execute.mockResolvedValueOnce({ id: organisationId } as Organisation);
    repository.findOne.mockResolvedValueOnce(member);

    const promise = handler.execute(new AddOrganisationMemberCommand(organisationId, dto));

    await expect(promise).rejects.toThrow(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException unchanged when the organisation does not exist', async () => {
    queryBus.execute.mockRejectedValueOnce(new NotFoundException('Organisation introuvable'));
    const promise = handler.execute(new AddOrganisationMemberCommand(organisationId, dto));

    await expect(promise).rejects.toThrow(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when adding the member fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce({ id: organisationId } as Organisation);
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(member);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new AddOrganisationMemberCommand(organisationId, dto));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Ajout du membre impossible');
  });
});
