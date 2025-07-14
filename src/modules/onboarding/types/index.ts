import { z } from 'zod';

export const OnboardingStepSchema = z.enum([
  'WELCOME',
  'LOGIN',
  'OTP_VERIFICATION',
  'USER_INFO',
  'PROFILE_SETUP'
]);

export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;

export const PhoneNumberSchema = z.string().regex(/^\d{10}$/);
export const OTPSchema = z.string().length(6);

export const UserInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  city: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  profilePicture: z.string().optional()
});

export type UserInfo = z.infer<typeof UserInfoSchema>;

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
}; 