import { BadRequestException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { OrganisationMember } from '../../entities/organisation-member.entity';
import { FindOrganisationMembersQuery } from '../impl';
import { FindOrganisationMembersHandler } from '../handlers/find-organisation-members.handler';

describe('FindOrganisationMembersHandler', () => {
  let repository: jest.Mocked<Pick<Repository<OrganisationMember>, 'find'>>;
  let handler: FindOrganisationMembersHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const organisationId = 'organisation-id';
  const members = [{ id: 'member-id', organisationId }] as OrganisationMember[];

  beforeEach(() => {
    repository = { find: jest.fn() };
    handler = new FindOrganisationMembersHandler(mockDependency<Repository<OrganisationMember>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns the members of an organisation ordered by join date', async () => {
    repository.find.mockResolvedValueOnce(members);

    const result = await handler.execute(new FindOrganisationMembersQuery(organisationId));

    expect(result).toBe(members);
    expect(repository.find).toHaveBeenCalledWith({ where: { organisationId }, order: { joinedAt: 'ASC' } });
  });

  it('throws BadRequestException when members cannot be found', async () => {
    repository.find.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new FindOrganisationMembersQuery(organisationId));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Membres introuvables');
  });
});
