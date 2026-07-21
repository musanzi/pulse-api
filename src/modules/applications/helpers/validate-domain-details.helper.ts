import { BadRequestException } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QuestDomain } from '@/modules/quests/enums';
import {
  AgritechDomainDetailsDto,
  CodingDomainDetailsDto,
  EnergyDomainDetailsDto,
  FinanceDomainDetailsDto,
  LogisticsDomainDetailsDto,
  MiningDomainDetailsDto
} from '../dto/domain-details';

/**
 * Each quest domain collects different application data, so the payload is validated
 * against the DTO matching the quest's domain rather than a single generic shape.
 * Unknown fields are rejected, which keeps the stored JSON clean enough to feed the
 * AI matching engine.
 */
const DOMAIN_DETAILS_DTOS: Record<QuestDomain, ClassConstructor<object>> = {
  [QuestDomain.CODING]: CodingDomainDetailsDto,
  [QuestDomain.FINANCE]: FinanceDomainDetailsDto,
  [QuestDomain.AGRITECH]: AgritechDomainDetailsDto,
  [QuestDomain.MINING]: MiningDomainDetailsDto,
  [QuestDomain.ENERGY]: EnergyDomainDetailsDto,
  [QuestDomain.LOGISTICS]: LogisticsDomainDetailsDto
};

export async function validateDomainDetails(domain: QuestDomain, details: unknown): Promise<void> {
  if (details === undefined || details === null) return;

  if (typeof details !== 'object' || Array.isArray(details)) {
    throw new BadRequestException('Les informations spécifiques au domaine sont invalides');
  }

  const dtoClass = DOMAIN_DETAILS_DTOS[domain];

  if (!dtoClass) {
    throw new BadRequestException(`Domaine de quête non pris en charge : ${domain}`);
  }

  const instance = plainToInstance(dtoClass, details);
  const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });

  if (errors.length > 0) {
    throw new BadRequestException(errors.flatMap((error) => Object.values(error.constraints ?? {})));
  }
}
