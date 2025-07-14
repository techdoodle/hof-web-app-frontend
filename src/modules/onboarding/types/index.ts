import { z } from 'zod';

export const OnboardingStepSchema = z.enum([
  'WELCOME',
  'LOGIN',
  'OTP_VERIFICATION',
  'USER_INFO',
  'GENDER_SELECTION',
  'PROFILE_SETUP',
  'POSITION_SELECTION',
  'TEAM_SELECTION'
]);

export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;

export const PhoneNumberSchema = z.string().regex(/^\d{10}$/);
export const OTPSchema = z.string().length(6);

export const UserInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  city: z.enum(['Gurugram', 'Noida', 'Delhi', 'Mumbai', 'Bengaluru', 'Pune']),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
});

export const GenderSelectionSchema = z.object({
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
});

export const PositionSelectionSchema = z.object({
  playerCategory: z.enum(['MIDFIELDER', 'STRIKER', 'DEFENDER', 'GOALKEEPER', 'CASUAL']),
});

export const TeamSelectionSchema = z.object({
  preferredTeam: z.number(),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;
export type GenderSelection = z.infer<typeof GenderSelectionSchema>;
export type PositionSelection = z.infer<typeof PositionSelectionSchema>;
export type TeamSelection = z.infer<typeof TeamSelectionSchema>;

export type UserData = {
  accessToken: string;
  refreshToken: string;
  addedToCommunity: boolean;
  createdAt: string;
  email: string | null;
  id: number;
  invitesLeft: number;
  lastLoginAt: string;
  onboardingComplete: boolean;
  phoneNumber: string;
  playerCategory: string | null;
  profilePicture: string | null;
  updatedAt: string;
  username: string | null;
  valid: boolean;
  firstName: string;
  lastName: string;
  city: string;
  gender: string;
  preferredTeam: number | null;
};

export type FootballTeam = {
  id: number;
  apiTeamId: number;
  teamName: string;
  teamCode: string | null;
  country: string;
  founded: number | null;
  national: boolean;
  logoUrl: string | null;
  leagueId: number | null;
  leagueName: string | null;
  leagueCountry: string | null;
  season: number | null;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}; 