import { UserRole } from '@/services/session';

export type InviteCodeType = 'club' | 'coach' | 'athlete' | 'parent';

export type InviteClub = {
  id: string;
  name: string;
};

export type InviteCodeRecord = {
  code: string;
  type: InviteCodeType;
  role: UserRole;
  clubId: string;
  clubName: string;
  groupName?: string;
  active: boolean;
  usageCount: number;
  maxUses?: number;
  createdAt: string;
};

export type ManualInviteCodeInput = {
  code: string;
  type: InviteCodeType;
  clubId?: string;
  groupName?: string;
  maxUses?: number;
};

export const inviteClubs: InviteClub[] = [
  { id: 'mev-koleji', name: 'MEV Koleji' },
  { id: 'bcsk', name: 'Başkent Çankaya Spor Kulübü' },
];

const roleByType: Record<InviteCodeType, UserRole> = {
  club: 'club_admin',
  coach: 'coach',
  athlete: 'athlete',
  parent: 'parent',
};

const prefixByType: Record<InviteCodeType, string> = {
  club: 'GP',
  coach: 'COACH',
  athlete: 'ATH',
  parent: 'PAR',
};

let inviteCodes: InviteCodeRecord[] = [
  createInviteRecord({ code: 'GP-MEV001', type: 'club', usageCount: 8, clubId: 'mev-koleji' }),
  createInviteRecord({ code: 'MEV-PERF', type: 'athlete', usageCount: 14, clubId: 'mev-koleji', groupName: 'Performans Grubu' }),
  createInviteRecord({ code: 'COACH-MEV', type: 'coach', usageCount: 3, clubId: 'mev-koleji' }),
  createInviteRecord({ code: 'ATH-MEV', type: 'athlete', usageCount: 17, clubId: 'mev-koleji' }),
  createInviteRecord({ code: 'PAR-MEV', type: 'parent', usageCount: 6, clubId: 'mev-koleji' }),
  createInviteRecord({ code: 'GP-BCSK001', type: 'club', usageCount: 5, clubId: 'bcsk' }),
  createInviteRecord({ code: 'BCSK-PERF', type: 'athlete', usageCount: 11, clubId: 'bcsk', groupName: 'Performans Grubu' }),
  createInviteRecord({ code: 'COACH-BCSK', type: 'coach', usageCount: 2, clubId: 'bcsk' }),
  createInviteRecord({ code: 'ATH-BCSK', type: 'athlete', usageCount: 12, clubId: 'bcsk' }),
  createInviteRecord({ code: 'PAR-BCSK', type: 'parent', usageCount: 4, clubId: 'bcsk' }),
];

export function generateClubCode(clubId?: string, groupName?: string) {
  return generateInviteCode('club', clubId, groupName);
}

export function generateCoachCode(clubId?: string, groupName?: string) {
  return generateInviteCode('coach', clubId, groupName);
}

export function generateAthleteCode(clubId?: string, groupName?: string) {
  return generateInviteCode('athlete', clubId, groupName);
}

export function generateParentCode(clubId?: string, groupName?: string) {
  return generateInviteCode('parent', clubId, groupName);
}

export function validateInviteCode(code: string) {
  const normalized = normalizeCode(code);
  const record = inviteCodes.find((item) => item.code === normalized && item.active);
  return record ? { valid: true as const, record } : { valid: false as const, message: 'Davet kodu geçersiz veya pasif.' };
}

export function createManualInviteCode(inputOrCode: ManualInviteCodeInput | string, fallbackType?: InviteCodeType) {
  const input = typeof inputOrCode === 'string' ? { code: inputOrCode, type: fallbackType ?? 'athlete' } : inputOrCode;
  const normalized = normalizeCode(input.code);
  if (!normalized) return { success: false as const, message: 'Kod boş olamaz.' };
  if (inviteCodes.some((item) => item.code === normalized)) return { success: false as const, message: 'Bu davet kodu zaten kullanılıyor.' };

  const record = createInviteRecord({
    code: normalized,
    type: input.type,
    usageCount: 0,
    clubId: input.clubId,
    groupName: input.groupName,
    maxUses: input.maxUses,
  });
  inviteCodes = [record, ...inviteCodes];
  return { success: true as const, record };
}

export function joinClubByCode(code: string) {
  const result = validateInviteCode(code);
  if (!result.valid) return result;
  result.record.usageCount += 1;
  return {
    valid: true as const,
    clubId: result.record.clubId,
    clubName: result.record.clubName,
    groupName: result.record.groupName,
    role: result.record.role,
    type: result.record.type,
    code: result.record.code,
  };
}

export function cancelInviteCode(code: string) {
  return setInviteCodeActive(code, false);
}

export function activateInviteCode(code: string) {
  return setInviteCodeActive(code, true);
}

export function setInviteCodeActive(code: string, active: boolean) {
  const normalized = normalizeCode(code);
  inviteCodes = inviteCodes.map((item) => (item.code === normalized ? { ...item, active } : item));
  return getInviteCodes();
}

export function getInviteCodes() {
  return [...inviteCodes];
}

function generateInviteCode(type: InviteCodeType, clubId?: string, groupName?: string) {
  let code = '';
  do {
    const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6).padEnd(6, '0');
    code = `${prefixByType[type]}-${suffix}`;
  } while (inviteCodes.some((item) => item.code === code));

  const record = createInviteRecord({ code, type, usageCount: 0, clubId, groupName });
  inviteCodes = [record, ...inviteCodes];
  return record;
}

function createInviteRecord(input: {
  code: string;
  type: InviteCodeType;
  usageCount: number;
  clubId?: string;
  groupName?: string;
  maxUses?: number;
}): InviteCodeRecord {
  const club = inviteClubs.find((item) => item.id === input.clubId) ?? inviteClubs[0];
  return {
    code: normalizeCode(input.code),
    type: input.type,
    role: roleByType[input.type],
    clubId: club.id,
    clubName: club.name,
    groupName: input.groupName?.trim() || undefined,
    active: true,
    usageCount: input.usageCount,
    maxUses: input.maxUses ?? (input.type === 'club' ? 2 : undefined),
    createdAt: new Date().toISOString(),
  };
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

// Firestore-ready structure:
// clubs/{clubId}/inviteCodes/{code}
// Each document can store type, role, groupName, active, usageCount, maxUses,
// createdBy, expiresAt, and audit metadata.
