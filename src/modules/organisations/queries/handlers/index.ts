import { Provider } from '@nestjs/common';
import { FindOrganisationsHandler } from './find-organisations.handler';
import { FindOrganisationByIdHandler } from './find-organisation-by-id.handler';
import { FindOrganisationMembersHandler } from './find-organisation-members.handler';

export const QueryHandlers: Provider[] = [
  FindOrganisationsHandler,
  FindOrganisationByIdHandler,
  FindOrganisationMembersHandler
];
