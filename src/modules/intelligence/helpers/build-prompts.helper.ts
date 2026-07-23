import { Application } from '@/modules/applications/entities/application.entity';
import { Quest } from '@/modules/quests/entities/quest.entity';

export const MATCH_SYSTEM_PROMPT =
  'You rank candidates against an opportunity for the DigiPulse talent platform. ' +
  'Judge only on the evidence given. Reply with JSON of the shape ' +
  '{"matches":[{"userId":string,"score":number 0-100,"reasoning":string}]}. ' +
  'The reasoning must state concretely why the candidate fits or does not.';

export const RECOMMENDATION_SYSTEM_PROMPT =
  'You are a career coach for the DigiPulse talent platform. Recommend opportunities that grow the ' +
  "talent's career and explain the gap they need to close. Reply with JSON of the shape " +
  '{"recommendations":[{"questId":string,"score":number 0-100,"reason":string,' +
  '"skillGaps":[{"skill":string,"current":string,"required":string}],' +
  '"steps":[{"title":string,"type":"QUEST"|"SKILL"|"RESOURCE","questId":string,"note":string}]}]}. ' +
  'Recommend at most 3 opportunities and keep every reason specific to the evidence given.';

/** Turns a quest and its applicants into the ranking prompt. */
export function buildMatchPrompt(quest: Quest, applications: Application[]): string {
  const requiredSkills = (quest.skills ?? []).map((skill) => skill.skillId).join(', ') || 'none listed';
  const candidates = applications
    .map((application) =>
      [
        `- userId: ${application.userId}`,
        `  motivation: ${application.motivation ?? 'not provided'}`,
        `  domainDetails: ${JSON.stringify(application.domainDetails ?? {})}`
      ].join('\n')
    )
    .join('\n');

  return [
    'OPPORTUNITY',
    `title: ${quest.title}`,
    `domain: ${quest.domain}`,
    `level: ${quest.level ?? 'unspecified'}`,
    `description: ${quest.description}`,
    `required skill ids: ${requiredSkills}`,
    '',
    'CANDIDATES',
    candidates,
    '',
    'Rank every candidate listed above. Return one entry per userId.'
  ].join('\n');
}

/** Turns a talent's application history and the open quests into the recommendation prompt. */
export function buildRecommendationPrompt(applications: Application[], quests: Quest[]): string {
  const profile = applications.length
    ? applications
        .map((application) => `- domainDetails: ${JSON.stringify(application.domainDetails ?? {})}`)
        .join('\n')
    : '- no application history yet';

  const opportunities = quests
    .map((quest) => `- questId: ${quest.id} | ${quest.title} | domain: ${quest.domain} | level: ${quest.level ?? 'any'}`)
    .join('\n');

  return [
    'TALENT EVIDENCE',
    profile,
    '',
    'OPEN OPPORTUNITIES',
    opportunities,
    '',
    'Recommend the opportunities that best grow this talent, and for each one list the steps to close the gap.'
  ].join('\n');
}
