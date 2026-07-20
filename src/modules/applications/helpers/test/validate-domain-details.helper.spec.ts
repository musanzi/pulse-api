import { BadRequestException } from '@nestjs/common';
import { QuestDomain } from '@/modules/quests/enums';
import { validateDomainDetails } from '../validate-domain-details.helper';

describe('validateDomainDetails', () => {
  it('accepts a valid CODING payload', async () => {
    await expect(
      validateDomainDetails(QuestDomain.CODING, {
        githubRepo: 'https://github.com/candidate/portfolio',
        programmingLanguages: ['Python', 'TypeScript'],
        yearsExperience: 5,
        projectLinks: ['https://example.com/project']
      })
    ).resolves.toBeUndefined();
  });

  it('accepts a valid FINANCE payload', async () => {
    await expect(
      validateDomainDetails(QuestDomain.FINANCE, {
        financeExperience: '5 years in investment banking',
        relevantCertifications: ['CFA Level 1'],
        yearsInFinance: 5
      })
    ).resolves.toBeUndefined();
  });

  it('skips validation when no details are provided', async () => {
    await expect(validateDomainDetails(QuestDomain.CODING, undefined)).resolves.toBeUndefined();
    await expect(validateDomainDetails(QuestDomain.CODING, null)).resolves.toBeUndefined();
  });

  it('rejects a payload that is not an object', async () => {
    await expect(validateDomainDetails(QuestDomain.CODING, 'not-an-object')).rejects.toThrow(BadRequestException);
    await expect(validateDomainDetails(QuestDomain.CODING, ['a', 'b'])).rejects.toThrow(BadRequestException);
  });

  it('rejects an invalid URL in a CODING payload', async () => {
    await expect(
      validateDomainDetails(QuestDomain.CODING, { githubRepo: 'javascript:alert(1)' })
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a negative or out-of-range yearsExperience', async () => {
    await expect(validateDomainDetails(QuestDomain.CODING, { yearsExperience: -1 })).rejects.toThrow(
      BadRequestException
    );
    await expect(validateDomainDetails(QuestDomain.CODING, { yearsExperience: 99 })).rejects.toThrow(
      BadRequestException
    );
  });

  it('rejects fields that belong to a different domain', async () => {
    await expect(
      validateDomainDetails(QuestDomain.CODING, { yearsInFinance: 5, caseStudyAnswer: 'text' })
    ).rejects.toThrow(BadRequestException);
  });

  it('validates each domain against its own schema', async () => {
    await expect(
      validateDomainDetails(QuestDomain.LOGISTICS, { logisticsExperience: 'supply chain', softwareSkills: ['SAP'] })
    ).resolves.toBeUndefined();

    // githubRepo is a CODING field, so it is not accepted for LOGISTICS
    await expect(
      validateDomainDetails(QuestDomain.LOGISTICS, { githubRepo: 'https://github.com/x/y' })
    ).rejects.toThrow(BadRequestException);
  });
});
