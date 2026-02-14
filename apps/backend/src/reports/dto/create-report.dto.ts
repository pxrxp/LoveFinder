import { IsEnum, IsString, MinLength } from 'class-validator';

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  FAKE_PROFILE = 'fake_profile',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SCAM = 'scam',
  IMPERSONATION = 'impersonation',
  HATE_SPEECH = 'hate_speech',
  DISCRIMINATION = 'discrimination',
  THREATS = 'threats',
  VIOLENCE = 'violence',
  NUDITY = 'nudity',
  SELF_HARM = 'self_harm',
  UNDERAGE_USER = 'underage_user',
  BULLYING = 'bullying',
  MISLEADING_INFORMATION = 'misleading_information',
  OFFENSIVE_LANGUAGE = 'offensive_language',
  OTHER = 'other',
}

export class CreateReportDto {
  @IsEnum(ReportReason)
  reason!: ReportReason;

  @IsString()
  @MinLength(10)
  details!: string;
}

