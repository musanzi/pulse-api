import { Provider } from '@nestjs/common';
import { FindApplicationsHandler } from './find-applications.handler';
import { FindApplicationByIdHandler } from './find-application-by-id.handler';

export const QueryHandlers: Provider[] = [FindApplicationsHandler, FindApplicationByIdHandler];
