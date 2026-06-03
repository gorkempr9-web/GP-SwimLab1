import Constants from 'expo-constants';

export type VerificationMethod = 'phone' | 'email';

export type VerificationSession = {
  verificationId: string;
  method: VerificationMethod;
  target: string;
  maskedTarget: string;
  expiresInSeconds: number;
  attempts: number;
  maxAttempts: number;
};

export type VerificationResult = {
  success: boolean;
  attempts: number;
  locked: boolean;
  message: string;
};

export class VerificationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VerificationServiceError';
  }
}

const mockCodes: Record<VerificationMethod, string> = {
  phone: '123456',
  email: '654321',
};

const attemptStore: Record<string, number> = {};
const maxAttempts = 3;
const expiresInSeconds = 60;

export const verificationUnavailableMessage =
  'Doğrulama servisi henüz aktif değil. Lütfen yönetici ile iletişime geçin.';

export const emailVerificationUnavailableMessage = 'E-posta doğrulama servisi henüz aktif değil.';

export function allowMockOtp() {
  const envEnabled = process.env.EXPO_PUBLIC_ENABLE_MOCK_OTP === 'true';
  const extraEnabled =
    Constants.expoConfig?.extra?.enableMockOtp === true ||
    Constants.expoConfig?.extra?.allowMockOtp === true;

  return Boolean(__DEV__ && (envEnabled || extraEnabled));
}

export function ensureMockOtpAllowed(method: VerificationMethod) {
  if (allowMockOtp()) return;
  throw new VerificationServiceError(method === 'email' ? emailVerificationUnavailableMessage : verificationUnavailableMessage);
}

export async function sendCode(method: VerificationMethod, target: string): Promise<VerificationSession> {
  ensureMockOtpAllowed(method);
  return createVerificationSession(method, target);
}

export async function verifyCode(method: VerificationMethod, code: string, verificationId = `${method}-default`): Promise<VerificationResult> {
  const attempts = (attemptStore[verificationId] ?? 0) + 1;
  attemptStore[verificationId] = attempts;
  const mockEnabled = allowMockOtp();
  const success = mockEnabled && code.trim() === mockCodes[method];
  const locked = !success && attempts >= maxAttempts;

  return {
    success,
    attempts,
    locked,
    message: success
      ? 'Doğrulama başarılı.'
      : locked
        ? '3 yanlış deneme yapıldı. Lütfen tekrar kod gönder.'
        : mockEnabled
          ? 'Yanlış doğrulama kodu.'
          : verificationUnavailableMessage,
  };
}

export async function resendCode(method: VerificationMethod, target: string): Promise<VerificationSession> {
  return sendCode(method, target);
}

export function getMockCode(method: VerificationMethod) {
  return allowMockOtp() ? mockCodes[method] : '';
}

export function createVerificationSession(method: VerificationMethod, target: string): VerificationSession {
  const verificationId = `${method}-${Date.now()}`;
  attemptStore[verificationId] = 0;

  return {
    verificationId,
    method,
    target,
    maskedTarget: maskTarget(method, target),
    expiresInSeconds,
    attempts: 0,
    maxAttempts,
  };
}

export function maskTarget(method: VerificationMethod, target: string) {
  if (method === 'email') {
    const [name, domain] = target.split('@');
    if (!name || !domain) {
      return target;
    }
    return `${name.slice(0, 2)}***@${domain}`;
  }

  const digits = target.replace(/\D/g, '');
  if (digits.length < 4) {
    return '***';
  }

  return `*** *** ${digits.slice(-2)}`;
}
