import {
  VerificationResult,
  VerificationServiceError,
  VerificationSession,
  allowMockOtp,
  createVerificationSession,
  verificationUnavailableMessage,
  verifyCode,
} from './verification';

export type PhoneAuthStartPayload = {
  countryCode: string;
  phoneNumber: string;
  userType: string;
  guardianPhoneNumber?: string;
};

export type PhoneAuthSession = VerificationSession & { maskedPhone: string };
export type OtpVerificationResult = VerificationResult;

let lastPhoneTarget = '';
let lastPhoneVerificationId = '';

export async function sendPhoneOtp(phoneNumber: string): Promise<PhoneAuthSession> {
  const target = phoneNumber.trim();

  if (!target) {
    throw new VerificationServiceError('Telefon numarası zorunludur.');
  }

  if (hasFirebasePhoneConfig()) {
    // Firebase Phone Auth burada bağlanacak:
    // signInWithPhoneNumber(auth, target) -> confirmationResult.verificationId
    throw new VerificationServiceError('Firebase Phone Auth entegrasyonu henüz aktif değil. Lütfen yönetici ile iletişime geçin.');
  }

  if (!allowMockOtp()) {
    throw new VerificationServiceError(verificationUnavailableMessage);
  }

  const session = createVerificationSession('phone', target);
  lastPhoneTarget = target;
  lastPhoneVerificationId = session.verificationId;
  return { ...session, maskedPhone: session.maskedTarget };
}

export async function verifyPhoneOtp(code: string, verificationId = lastPhoneVerificationId): Promise<OtpVerificationResult> {
  return verifyCode('phone', code, verificationId);
}

export async function resendPhoneOtp(phoneNumber = lastPhoneTarget): Promise<PhoneAuthSession> {
  return sendPhoneOtp(phoneNumber);
}

export async function startPhoneVerification(payload: PhoneAuthStartPayload): Promise<PhoneAuthSession> {
  return sendPhoneOtp(`${payload.countryCode} ${payload.phoneNumber}`);
}

export async function verifyOtpCode(verificationId: string, code: string): Promise<OtpVerificationResult> {
  return verifyPhoneOtp(code, verificationId);
}

export async function resendOtpCode(targetOrVerificationId: string): Promise<PhoneAuthSession> {
  return resendPhoneOtp(targetOrVerificationId || lastPhoneTarget);
}

function hasFirebasePhoneConfig() {
  return Boolean(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  );
}
