import { Provider } from '@nestjs/common';
import { CreateApplicationHandler } from './create-application.handler';
import { AcceptApplicationHandler } from './accept-application.handler';
import { RejectApplicationHandler } from './reject-application.handler';
import { WithdrawApplicationHandler } from './withdraw-application.handler';

export const CommandHandlers: Provider[] = [
  CreateApplicationHandler,
  AcceptApplicationHandler,
  RejectApplicationHandler,
  WithdrawApplicationHandler
];
