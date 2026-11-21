import { z } from 'zod';

export const phoneSchema = z.string().regex(
  /^(\+233|0)[0-9]{9}$/,
  'Invalid Ghana phone number'
);

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  display_name: z.string().min(2, 'Name too short').max(80, 'Name too long'),
  referral_code: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, 'OTP must be 6 digits'),
  ref_code: z.string().optional(),
});

export const depositSchema = z.object({
  amount: z.number().min(250, 'Minimum deposit is GHS 250').max(100000, 'Maximum deposit is GHS 100,000'),
});

export const withdrawalSchema = z.object({
  amount: z.number().min(50, 'Minimum withdrawal is GHS 50'),
  channel: z.enum(['mobile_money', 'bank']),
  details: z.object({
    account_name: z.string().min(1).max(100),
    account_number: z.string().min(1).max(30),
    bank_name: z.string().optional(),
    network: z.string().optional(),
  }),
});

export const adjustBalanceSchema = z.object({
  amount: z.number().min(-99999).max(99999),
  reason: z.string().min(1).max(500),
});
