import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FeedbackType } from '../enums';

export class CreateRecommendationFeedbackDto {
  @IsEnum(FeedbackType)
  feedbackType: FeedbackType;

  @IsString()
  @IsOptional()
  comment?: string;
}
