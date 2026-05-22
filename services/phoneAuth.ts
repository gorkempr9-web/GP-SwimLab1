import { VerificationResult, VerificationSession, resendCode, sendCode, verifyCode } from './verification';

export type PhoneAuthStartPayload = {
  countryCode: string;
  phoneNumber: string;
  userType: string;
  guardianPhoneNumber?: string;
};

export type PhoneAuthSession = VerificationSession & { maskedPhone: string };
export type OtpVerificationResult = VerificationResult;

export async function startPhoneVerification(payload: PhoneAuthStartPayload): Promise<PhoneAuthSession> {
  const session = await sendCode('phone', `${payload.countryCode} ${payload.phoneNumber.trim()}`);
  return { ...session, maskedPhone: session.maskedTarget };
}

export async function verifyOtpCode(verificationId: string, code: string): Promise<OtpVerificationResult> {
  return verifyCode('phone', code, verificationId);
}

export async function resendOtpCode(targetOrVerificationId: string): Promise<PhoneAuthSession> {
  const session = await resendCode('phone', targetOrVerificationId);
  return { ...session, maskedPhone: session.maskedTarget };
}
