export type SafetyLevel = 'safe' | 'warning' | 'blocked';

export type SafetyResult = {
  level: SafetyLevel;
  message: string;
  maskedText?: string;
  reasons: string[];
};

const allowedDomains = ['gp-swimlab.app', 'firebase.google.com', 'expo.dev', 'youtube.com', 'vimeo.com'];
const shortLinkDomains = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly'];
const riskyFileExtensions = ['.apk', '.exe', '.bat', '.cmd', '.js', '.scr', '.zip'];
const safeFileExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];

export function scanTextSafety(text: string): SafetyResult {
  const reasons: string[] = [];
  if (/\b\d{11}\b/.test(text)) reasons.push('TC kimlik benzeri numara');
  if (/\b(?:\d[ -]*?){13,19}\b/.test(text)) reasons.push('Banka kartı benzeri numara');
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) reasons.push('E-posta adresi');
  if (/(?:\+90|0)?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/.test(text)) reasons.push('Telefon numarası');
  if (/(mahalle|sokak|cadde|apartman|daire|no:)/i.test(text)) reasons.push('Açık adres ifadesi');

  return {
    level: reasons.length ? 'warning' : 'safe',
    message: reasons.length ? 'Hassas bilgi tespit edildi ve maskelendi.' : 'Metin güvenli görünüyor.',
    maskedText: maskSensitiveInfo(text),
    reasons,
  };
}

export function scanLinkSafety(url: string): SafetyResult {
  const reasons: string[] = [];
  const normalizedUrl = normalizeUrl(url);
  const lowerUrl = normalizedUrl.toLowerCase();

  if (!isAllowedDomain(normalizedUrl)) reasons.push('Bu bağlantı güvenli olarak doğrulanmadı.');
  if (shortLinkDomains.some((domain) => lowerUrl.includes(domain))) reasons.push('Bilinmeyen kısa link');
  if (riskyFileExtensions.some((extension) => lowerUrl.endsWith(extension) || lowerUrl.includes(`${extension}?`))) reasons.push('Riskli dosya bağlantısı');
  if (/(banka|kart|şifre|sifre|password|kimlik|login|verify)/i.test(lowerUrl)) reasons.push('Kimlik veya banka bilgisi isteyen şüpheli bağlantı');

  return {
    level: reasons.some((reason) => reason.includes('Riskli') || reason.includes('banka')) ? 'blocked' : reasons.length ? 'warning' : 'safe',
    message: reasons.length ? reasons[0] : 'Bağlantı güvenli listede.',
    reasons,
  };
}

export function isAllowedDomain(url: string) {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.replace(/^www\./, '');
    return allowedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export function maskSensitiveInfo(text: string) {
  return text
    .replace(/([A-Z0-9._%+-])[A-Z0-9._%+-]*(@[A-Z0-9.-]+\.[A-Z]{2,})/gi, '$1***$2')
    .replace(/(?:\+90|0)?\s?5(\d{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})/g, '05$1 *** ** **')
    .replace(/\b\d{11}\b/g, '***********')
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, '**** **** **** ****');
}

export function validateAttachmentMock(fileName: string): SafetyResult {
  const lowerName = fileName.trim().toLowerCase();
  const blocked = riskyFileExtensions.find((extension) => lowerName.endsWith(extension));
  const allowed = safeFileExtensions.find((extension) => lowerName.endsWith(extension));

  if (blocked) {
    return { level: 'blocked', message: `${blocked} uzantılı dosyalar yüklenemez.`, reasons: ['Riskli dosya uzantısı'] };
  }

  if (!allowed) {
    return { level: 'warning', message: 'Dosya türü mock güvenlik listesinde değil.', reasons: ['Bilinmeyen dosya türü'] };
  }

  return { level: 'safe', message: 'Dosya türü izinli.', reasons: [] };
}

export function reportSecurityIssue(reason: string) {
  return {
    id: `security-${Date.now()}`,
    reason,
    status: 'received' as const,
    message: 'Şüpheli durum bildiriminiz alındı.',
  };
}

function normalizeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
