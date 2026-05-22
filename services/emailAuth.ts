import { VerificationResult, VerificationSession, resendCode, sendCode, verifyCode } from './verification';

export type EmailAuthStartPayload = {
  email: string;
  userType: string;
  guardianEmail?: string;
};

export type EmailAuthSession = VerificationSession;
export type EmailVerificationResult = VerificationResult;

export async function startEmailVerification(payload: EmailAuthStartPayload): Promise<EmailAuthSession> {
  return sendCode('email', payload.email.trim());
}

export async function verifyEmailCode(verificationId: string, code: string): Promise<EmailVerificationResult> {
  return verifyCode('email', code, verificationId);
}

export async function resendEmailCode(target: string): Promise<EmailAuthSession> {
  return resendCode('email', target);
}
