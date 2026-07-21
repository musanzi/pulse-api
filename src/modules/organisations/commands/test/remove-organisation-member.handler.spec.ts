import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { OrganisationMember } from '../../entities/organisation-member.entity';
import { OrgMemberRole } from '../../enums';
import { RemoveOrganisationMemberCommand } from '../impl';
import { RemoveOrganisationMemberHandler } from '../handlers/remove-organisation-member.handler';

describe('RemoveOrganisationMemberHandler', () => {
  let repository: jest.Mocked<Pick<Repository<OrganisationMember>, 'findOne' | 'count' | 'delete'>>;
  let handler: RemoveOrganisationMemberHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const organisationId = 'organisation-id';
  const memberId = 'member-id';
  const recruiter = { id: memberId, organisationId, memberRole: OrgMemberRole.RECRUITER } as OrganisationMember;
  const owner = { id: memberId, organisationId, memberRole: OrgMemberRole.OWNER } as OrganisationMember;

  beforeEach(() => {
    repository = { findOne: jest.fn(), count: jest.fn(), delete: jest.fn() };
    handler = new RemoveOrganisationMemberHandler(mockDependency<Repository<OrganisationMember>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('removes a recruiter without checking owner count', async () => {
    repository.findOne.mockResolvedValueOnce(recruiter);
    repository.delete.mockResolvedValueOnce({ affected: 1, raw: [] } as DeleteResult);

    await handler.execute(new RemoveOrganisationMemberCommand(organisationId, memberId));

    expect(repository.count).not.toHaveBeenCalled();
    expect(repository.delete).toHaveBeenCalledWith(memberId);
  });

  it('removes an owner when another owner remains', async () => {
    repository.findOne.mockResolvedValueOnce(owner);
    repository.count.mockResolvedValueOnce(2);
    repository.delete.mockResolvedValueOnce({ affected: 1, raw: [] } as DeleteResult);

    await handler.execute(new RemoveOrganisationMemberCommand(organisationId, memberId));

    expect(repository.delete).toHaveBeenCalledWith(memberId);
  });

  it('refuses to remove the last owner', async () => {
    repository.findOne.mockResolvedValueOnce(owner);
    repository.count.mockResolvedValueOnce(1);

    const promise = handler.execute(new RemoveOrganisationMemberCommand(organisationId, memberId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Une organisation doit conserver au moins un propriétaire');
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the member does not belong to the organisation', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    const promise = handler.execute(new RemoveOrganisationMemberCommand(organisationId, memberId));

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Membre introuvable');
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when the deletion fails unexpectedly', async () => {
    repository.findOne.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new RemoveOrganisationMemberCommand(organisationId, memberId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Suppression du membre impossible');
  });
});
