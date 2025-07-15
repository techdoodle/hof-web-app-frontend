import { useCallback } from 'react';
import { OnboardingStep, UserData } from '@/modules/onboarding/types';
import { OnboardingRepository } from '@/modules/onboarding/repository/onboarding.repository';
import { getAccessToken } from '@/lib/utils/auth';
import { useQueryClient } from '@tanstack/react-query';

export interface OnboardingEvent {
  type: 'step_completed' | 'step_skipped' | 'onboarding_completed' | 'onboarding_skipped';
  step?: OnboardingStep;
  progress?: number;
  timestamp: string;
  userId?: number;
}

export function useOnboardingTracking() {
    const onboardingRepository = OnboardingRepository.getInstance();
    const queryClient = useQueryClient();
    const user = queryClient.getQueryData(['user']) as UserData;

  const trackEvent = useCallback((event: OnboardingEvent) => {
    console.log('Onboarding Event:', event);
    
    // Store in localStorage for persistence
    const existingEvents = JSON.parse(localStorage.getItem('onboarding_events') || '[]');
    existingEvents.push(event);
    localStorage.setItem('onboarding_events', JSON.stringify(existingEvents));
    
    // Optional: Send to analytics service
    // analytics.track(event.type, {
    //   step: event.step,
    //   progress: event.progress,
    //   timestamp: event.timestamp,
    //   userId: event.userId
    // });
  }, []);

  const markOnboardingCompleted = useCallback(async () => {
    if (!user?.id) {
      console.error('No user ID available for marking onboarding complete');
      return;
    }
    
    try {
      console.log('Marking onboarding as completed for user:', user.id);
      const updatedUser = await onboardingRepository.updateUserInfo({
        onboardingComplete: true,
      }, user.id, getAccessToken() as string);
      
      // Update the query cache with the new user data
      queryClient.setQueryData(['user'], updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Onboarding marked as completed successfully');
      return updatedUser;
    } catch (error) {
      console.error('Failed to mark onboarding as completed:', error);
      throw error;
    }
  }, [user, onboardingRepository, queryClient]);

  const trackStepCompleted = useCallback((step: OnboardingStep, progress: number, userId?: number) => {
    trackEvent({
      type: 'step_completed',
      step,
      progress,
      timestamp: new Date().toISOString(),
      userId
    });
  }, [trackEvent]);

  const trackStepSkipped = useCallback((step: OnboardingStep, progress: number, userId?: number) => {
    trackEvent({
      type: 'step_skipped',
      step,
      progress,
      timestamp: new Date().toISOString(),
      userId
    });
  }, [trackEvent]);

  const trackOnboardingCompleted = useCallback((userId?: number) => {
    trackEvent({
      type: 'onboarding_completed',
      progress: 100,
      timestamp: new Date().toISOString(),
      userId
    });
    markOnboardingCompleted();
  }, [trackEvent]);

  const trackOnboardingSkipped = useCallback((currentStep: OnboardingStep, progress: number, userId?: number) => {
    trackEvent({
      type: 'onboarding_skipped',
      step: currentStep,
      progress,
      timestamp: new Date().toISOString(),
      userId
    });
    markOnboardingCompleted();
  }, [trackEvent]);

  const getOnboardingEvents = useCallback(() => {
    return JSON.parse(localStorage.getItem('onboarding_events') || '[]') as OnboardingEvent[];
  }, []);

  const clearOnboardingEvents = useCallback(() => {
    localStorage.removeItem('onboarding_events');
  }, []);

  return {
    trackStepCompleted,
    trackStepSkipped,
    trackOnboardingCompleted,
    trackOnboardingSkipped,
    markOnboardingCompleted,
    getOnboardingEvents,
    clearOnboardingEvents
  };
} 