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

const mockCodes: Record<VerificationMethod, string> = {
  phone: '123456',
  email: '654321',
};

const attemptStore: Record<string, number> = {};
const maxAttempts = 3;
const expiresInSeconds = 60;

export async function sendCode(method: VerificationMethod, target: string): Promise<VerificationSession> {
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

export async function verifyCode(method: VerificationMethod, code: string, verificationId = `${method}-default`): Promise<VerificationResult> {
  const attempts = (attemptStore[verificationId] ?? 0) + 1;
  attemptStore[verificationId] = attempts;
  const success = code.trim() === mockCodes[method];
  const locked = !success && attempts >= maxAttempts;

  return {
    success,
    attempts,
    locked,
    message: success ? 'Doğrulama başarılı.' : locked ? '3 yanlış deneme yapıldı. Lütfen tekrar kod gönder.' : 'Yanlış doğrulama kodu.',
  };
}

export async function resendCode(method: VerificationMethod, target: string): Promise<VerificationSession> {
  return sendCode(method, target);
}

export function getMockCode(method: VerificationMethod) {
  return mockCodes[method];
}

function maskTarget(method: VerificationMethod, target: string) {
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
