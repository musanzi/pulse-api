import { IPagination } from '@/shared/interfaces';
import { QuestDomain, QuestStatus } from '../enums';

export interface IFilterQuests extends IPagination {
  q?: string;
  domain?: QuestDomain;
  status?: QuestStatus;
}
