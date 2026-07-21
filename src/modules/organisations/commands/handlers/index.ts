import { Provider } from '@nestjs/common';
import { CreateOrganisationHandler } from './create-organisation.handler';
import { UpdateOrganisationHandler } from './update-organisation.handler';
import { DeleteOrganisationHandler } from './delete-organisation.handler';
import { AddOrganisationMemberHandler } from './add-organisation-member.handler';
import { RemoveOrganisationMemberHandler } from './remove-organisation-member.handler';

export const CommandHandlers: Provider[] = [
  CreateOrganisationHandler,
  UpdateOrganisationHandler,
  DeleteOrganisationHandler,
  AddOrganisationMemberHandler,
  RemoveOrganisationMemberHandler
];
