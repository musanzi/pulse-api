import { Query } from '@nestjs/cqrs';
import { Quest } from '../../entities/quest.entity';
import { IFilterQuests } from '../../interfaces';

export class FindQuestsQuery extends Query<[Quest[], number]> {
  constructor(public readonly params: IFilterQuests = {}) {
    super();
  }
}
