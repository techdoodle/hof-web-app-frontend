import { useState, useRef, useEffect } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { OTPSchema } from '../types';

interface OTPVerificationScreenProps {
  phoneNumber: string;
  onSubmit: (otp: string) => Promise<void>;
  onResendOTP: () => Promise<void>;
  isLoading: boolean;
  error?: Error | null;
  otpAttempts: number;
  maxOtpAttempts: number;
  resendAttempts: number;
  maxResendAttempts: number;
  invalidOtpError?: string | null;
}

export function OTPVerificationScreen({
  phoneNumber,
  onSubmit,
  onResendOTP,
  isLoading,
  error,
  otpAttempts,
  maxOtpAttempts,
  resendAttempts,
  maxResendAttempts,
  invalidOtpError,
}: OTPVerificationScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [validationError, setValidationError] = useState('');
  const [timer, setTimer] = useState(30); // 30 seconds for resend
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Try to submit if all digits are filled
    // if (value && index === 5) {
    //   handleSubmit();
    // }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    
    try {
      OTPSchema.parse(otpString);
      setValidationError('');
      await onSubmit(otpString);
    } catch (err) {
      setValidationError('Please enter a valid 6-digit code');
    }
  };

  // Timer logic
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer]);

  // Start timer on mount
  useEffect(() => {
    setTimer(30);
  }, []);

  const handleResend = async () => {
    await onResendOTP();
    setTimer(30);
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const attemptsExceeded = otpAttempts >= maxOtpAttempts;
  const resendLimitReached = resendAttempts >= maxResendAttempts;

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold mb-4">
        Enter the 6-digit code
        <br />
        sent to you at
        <br />
        {phoneNumber}
      </h1>

      <div className="mt-8 flex justify-between gap-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="otp-input w-14 h-14 text-center text-white text-2xl font-bold rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            disabled={attemptsExceeded}
          />
        ))}
      </div>

      {(validationError || error || invalidOtpError) && (
        <p className="mt-4 text-sm text-red-600">
          {validationError || invalidOtpError || error?.message}
        </p>
      )}
      {attemptsExceeded && (
        <p className="mt-4 text-sm text-red-600">
          Too many incorrect attempts. Please resend OTP.
        </p>
      )}

      <button
        onClick={handleResend}
        className="mt-4 text-sm text-primary hover:underline disabled:opacity-50"
        disabled={isLoading || timer > 0 || resendLimitReached}
      >
        I haven't received a code ({`0:${timer.toString().padStart(2, '0')}`})
      </button>
      {resendLimitReached && (
        <p className="mt-2 text-sm text-red-600">
          You have reached the maximum number of resends. Please try again later or contact support.
        </p>
      )}

      <div className="mt-auto mb-4">
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          size="lg"
          variant='gradient'
          disabled={otp.some((digit) => !digit) || attemptsExceeded}
        >
          Continue
        </Button>
      </div>
    </div>
  );
} 