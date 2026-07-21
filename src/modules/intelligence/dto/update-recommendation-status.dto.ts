import { IsEnum } from 'class-validator';
import { RecommendationStatus } from '../enums';

export class UpdateRecommendationStatusDto {
  @IsEnum(RecommendationStatus)
  status: RecommendationStatus;
}
