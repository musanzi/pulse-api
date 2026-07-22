import { TalentProfile } from '../entities/talent-profile.entity';

export interface ICvData {
  generatedAt: string;
  personal: {
    firstName: string;
    lastName: string;
    phone: string;
    location: string;
    portfolio: string;
    avatarUrl: string;
  };
  summary: string;
  education: string;
  availability: number;
  yearsExperience: number;
  skills: string[];
  achievements: unknown[];
  projects: unknown[];
}

export interface ITalentProfileResponse extends TalentProfile {}
