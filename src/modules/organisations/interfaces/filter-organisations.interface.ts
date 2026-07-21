import { IPagination } from '@/shared/interfaces';

export interface IFilterOrganisations extends IPagination {
  q?: string;
  sector?: string;
}
