import { IPagination } from '@/shared/interfaces';
import { ApplicationStatus } from '../enums';

export interface IFilterApplications extends IPagination {
  questId?: string;
  userId?: string;
  status?: ApplicationStatus;
}
