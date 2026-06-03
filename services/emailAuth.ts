import {
  VerificationResult,
  VerificationServiceError,
  VerificationSession,
  allowMockOtp,
  createVerificationSession,
  emailVerificationUnavailableMessage,
  verifyCode,
} from './verification';

export type EmailAuthStartPayload = {
  email: string;
  userType: string;
  guardianEmail?: string;
};

export type EmailAuthSession = VerificationSession;
export type EmailVerificationResult = VerificationResult;

let lastEmailTarget = '';
let lastEmailVerificationId = '';

export async function sendEmailOtp(email: string): Promise<EmailAuthSession> {
  const target = email.trim().toLowerCase();

  if (!target) {
    throw new VerificationServiceError('E-posta adresi zorunludur.');
  }

  if (hasEmailOtpBackend()) {
    // Gerçek backend burada bağlanacak:
    // POST `${EXPO_PUBLIC_EMAIL_OTP_ENDPOINT}/send` { email: target }
    throw new VerificationServiceError('E-posta OTP backend entegrasyonu henüz aktif değil.');
  }

  if (!allowMockOtp()) {
    throw new VerificationServiceError(emailVerificationUnavailableMessage);
  }

  const session = createVerificationSession('email', target);
  lastEmailTarget = target;
  lastEmailVerificationId = session.verificationId;
  return session;
}

export async function verifyEmailOtp(code: string, verificationId = lastEmailVerificationId): Promise<EmailVerificationResult> {
  return verifyCode('email', code, verificationId);
}

export async function resendEmailOtp(email = lastEmailTarget): Promise<EmailAuthSession> {
  return sendEmailOtp(email);
}

export async function startEmailVerification(payload: EmailAuthStartPayload): Promise<EmailAuthSession> {
  return sendEmailOtp(payload.email);
}

export async function verifyEmailCode(verificationId: string, code: string): Promise<EmailVerificationResult> {
  return verifyEmailOtp(code, verificationId);
}

export async function resendEmailCode(target: string): Promise<EmailAuthSession> {
  return resendEmailOtp(target || lastEmailTarget);
}

function hasEmailOtpBackend() {
  return Boolean(process.env.EXPO_PUBLIC_EMAIL_OTP_ENDPOINT);
}
