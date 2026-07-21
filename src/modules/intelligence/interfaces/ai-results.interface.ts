/** Shapes the AI is asked to return. Everything is validated before it reaches the database. */

export interface IAiMatch {
  userId: string;
  score: number;
  reasoning: string;
}

export interface IAiMatchResponse {
  matches: IAiMatch[];
}

export interface IAiLearningStep {
  title: string;
  type?: string;
  questId?: string;
  note?: string;
}

export interface IAiRecommendation {
  questId?: string;
  score?: number;
  reason: string;
  skillGaps?: Record<string, unknown>[];
  steps?: IAiLearningStep[];
}

export interface IAiRecommendationResponse {
  recommendations: IAiRecommendation[];
}
