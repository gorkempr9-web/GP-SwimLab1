import { readRootCollection, readRootDocument, writeRootDocument } from '@/services/firestoreData';
import { UserRole } from '@/services/session';

export type InviteCodeType = 'club' | 'coach' | 'athlete' | 'parent';
export type InviteRole = UserRole;

export type InviteClub = {
  id: string;
  name: string;
  codePrefix: string;
};

export type InviteCodeRecord = {
  code: string;
  clubId: string;
  clubName: string;
  role: InviteRole;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  note: string;
  groupName?: string;
  type: InviteCodeType;
  active: boolean;
  usageCount: number;
};

export type ManualInviteCodeInput = {
  code: string;
  type: InviteCodeType;
  clubId?: string;
  groupName?: string;
  maxUses?: number;
};

export type AdminInviteCodeInput = {
  code?: string;
  clubId?: string;
  role: InviteRole;
  note?: string;
  maxUses?: number;
  expiresAt?: string;
  isActive?: boolean;
  createdBy?: string;
  groupName?: string;
};

type InviteValidationResult =
  | { valid: true; record: InviteCodeRecord }
  | { valid: false; message: string; record?: InviteCodeRecord };

export const inviteClubs: InviteClub[] = [
  { id: 'mev-koleji', name: 'MEV Koleji', codePrefix: 'MEV' },
  { id: 'baskent-cankaya', name: 'Başkent Çankaya Spor Kulübü', codePrefix: 'BASKENT' },
  { id: 'pilot-club', name: 'SwimLab Pilot Kulüp', codePrefix: 'PILOT' },
  { id: 'all-clubs', name: 'Tüm kulüpler', codePrefix: 'ADMIN' },
];

const roleByType: Record<InviteCodeType, UserRole> = {
  club: 'club_admin',
  coach: 'coach',
  athlete: 'athlete',
  parent: 'parent',
};

const typeByRole: Record<InviteRole, InviteCodeType> = {
  athlete: 'athlete',
  parent: 'parent',
  coach: 'coach',
  club_admin: 'club',
  super_admin: 'club',
};

const roleCodePart: Record<InviteRole, string> = {
  athlete: 'ATH',
  parent: 'PARENT',
  coach: 'COACH',
  club_admin: 'CLUB',
  super_admin: 'ADMIN',
};

let inviteCodes: InviteCodeRecord[] = [
  createInviteRecord({ code: 'GP-MEV001', role: 'club_admin', usedCount: 8, clubId: 'mev-koleji', note: 'MEV Koleji kulüp yöneticisi pilot kodu' }),
  createInviteRecord({ code: 'MEV-PERF', role: 'athlete', usedCount: 14, clubId: 'mev-koleji', groupName: 'Performans Grubu', note: 'MEV performans grubu' }),
  createInviteRecord({ code: 'COACH-MEV', role: 'coach', usedCount: 3, clubId: 'mev-koleji' }),
  createInviteRecord({ code: 'ATH-MEV', role: 'athlete', usedCount: 17, clubId: 'mev-koleji' }),
  createInviteRecord({ code: 'PAR-MEV', role: 'parent', usedCount: 6, clubId: 'mev-koleji' }),
  createInviteRecord({ code: 'GP-BCSK001', role: 'club_admin', usedCount: 5, clubId: 'baskent-cankaya' }),
  createInviteRecord({ code: 'BCSK-PERF', role: 'athlete', usedCount: 11, clubId: 'baskent-cankaya', groupName: 'Performans Grubu' }),
  createInviteRecord({ code: 'COACH-BCSK', role: 'coach', usedCount: 2, clubId: 'baskent-cankaya' }),
  createInviteRecord({ code: 'ATH-BCSK', role: 'athlete', usedCount: 12, clubId: 'baskent-cankaya' }),
  createInviteRecord({ code: 'PAR-BCSK', role: 'parent', usedCount: 4, clubId: 'baskent-cankaya' }),
  createInviteRecord({ code: 'SPORCU26', role: 'athlete', clubId: 'pilot-club', note: 'Fallback demo sporcu kodu' }),
  createInviteRecord({ code: 'VELI26', role: 'parent', clubId: 'pilot-club', note: 'Fallback demo veli kodu' }),
  createInviteRecord({ code: 'ANT26', role: 'coach', clubId: 'pilot-club', note: 'Fallback demo antrenör kodu' }),
  createInviteRecord({ code: 'KULUP26', role: 'club_admin', clubId: 'pilot-club', note: 'Fallback demo kulüp yöneticisi kodu' }),
  createInviteRecord({ code: 'ADMIN26', role: 'super_admin', clubId: 'all-clubs', maxUses: 999, note: 'Super admin pilot kodu' }),
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

export function validateInviteCode(code: string, expectedRole?: InviteRole): InviteValidationResult {
  const normalized = normalizeCode(code);
  const record = inviteCodes.find((item) => item.code === normalized);
  return validateInviteRecord(record, expectedRole);
}

export async function validateInviteCodeForUse(code: string, expectedRole?: InviteRole) {
  const normalized = normalizeCode(code);
  const firestoreRecord = await readRootDocument<InviteCodeRecord | null>('inviteCodes', normalized, null);
  if (firestoreRecord) {
    const normalizedRecord = normalizeInviteRecord(firestoreRecord);
    upsertInviteRecord(normalizedRecord);
    return validateInviteRecord(normalizedRecord, expectedRole);
  }
  return validateInviteCode(normalized, expectedRole);
}

export async function redeemInviteCode(code: string, expectedRole?: InviteRole) {
  const result = await validateInviteCodeForUse(code, expectedRole);
  if (!result.valid) return result;

  const record = {
    ...result.record,
    usedCount: result.record.usedCount + 1,
    usageCount: result.record.usedCount + 1,
  };
  upsertInviteRecord(record);
  await syncInviteCode(record);
  return {
    valid: true as const,
    record,
    clubId: record.clubId,
    clubName: record.clubName,
    groupName: record.groupName,
    role: record.role,
    type: record.type,
    code: record.code,
  };
}

export function createManualInviteCode(inputOrCode: ManualInviteCodeInput | string, fallbackType?: InviteCodeType) {
  const input = typeof inputOrCode === 'string' ? { code: inputOrCode, type: fallbackType ?? 'athlete' } : inputOrCode;
  return createInviteCode({
    code: input.code,
    role: roleByType[input.type],
    clubId: input.clubId,
    groupName: input.groupName,
    maxUses: input.maxUses,
    note: input.groupName,
  });
}

export function createInviteCode(input: AdminInviteCodeInput) {
  const normalized = normalizeCode(input.code || generateReadableCode(input.clubId, input.role));
  if (!normalized) return { success: false as const, message: 'Kod boş olamaz.' };
  if (inviteCodes.some((item) => item.code === normalized)) return { success: false as const, message: 'Bu davet kodu zaten kullanılıyor.' };

  const record = createInviteRecord({
    code: normalized,
    role: input.role,
    clubId: input.role === 'super_admin' ? 'all-clubs' : input.clubId,
    groupName: input.groupName,
    maxUses: input.maxUses,
    expiresAt: input.expiresAt,
    isActive: input.isActive ?? true,
    createdBy: input.createdBy,
    note: input.note,
  });
  inviteCodes = [record, ...inviteCodes];
  void syncInviteCode(record);
  return { success: true as const, record };
}

export function joinClubByCode(code: string) {
  const result = validateInviteCode(code);
  if (!result.valid) return result;
  const record = {
    ...result.record,
    usedCount: result.record.usedCount + 1,
    usageCount: result.record.usedCount + 1,
  };
  upsertInviteRecord(record);
  void syncInviteCode(record);
  return {
    valid: true as const,
    clubId: record.clubId,
    clubName: record.clubName,
    groupName: record.groupName,
    role: record.role,
    type: record.type,
    code: record.code,
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
  inviteCodes = inviteCodes.map((item) => (item.code === normalized ? { ...item, active, isActive: active } : item));
  const record = inviteCodes.find((item) => item.code === normalized);
  if (record) void syncInviteCode(record);
  return getInviteCodes();
}

export function getInviteCodes() {
  return [...inviteCodes];
}

export async function getInviteCodesAsync() {
  const rows = await readRootCollection<InviteCodeRecord>('inviteCodes', inviteCodes);
  inviteCodes = rows.map(normalizeInviteRecord);
  return getInviteCodes();
}

function generateInviteCode(type: InviteCodeType, clubId?: string, groupName?: string) {
  const record = createInviteRecord({
    code: generateReadableCode(clubId, roleByType[type]),
    role: roleByType[type],
    usedCount: 0,
    clubId,
    groupName,
  });
  inviteCodes = [record, ...inviteCodes];
  void syncInviteCode(record);
  return record;
}

function createInviteRecord(input: {
  code: string;
  role?: InviteRole;
  type?: InviteCodeType;
  usedCount?: number;
  usageCount?: number;
  clubId?: string;
  groupName?: string;
  maxUses?: number;
  expiresAt?: string;
  isActive?: boolean;
  active?: boolean;
  createdBy?: string;
  createdAt?: string;
  note?: string;
}): InviteCodeRecord {
  const role = input.role ?? (input.type ? roleByType[input.type] : 'athlete');
  const club = inviteClubs.find((item) => item.id === input.clubId) ?? (role === 'super_admin' ? inviteClubs.find((item) => item.id === 'all-clubs') : inviteClubs[0]) ?? inviteClubs[0];
  const usedCount = input.usedCount ?? input.usageCount ?? 0;
  const isActive = input.isActive ?? input.active ?? true;
  return {
    code: normalizeCode(input.code),
    clubId: club.id,
    clubName: club.name,
    role,
    createdBy: input.createdBy || 'system',
    createdAt: input.createdAt || new Date().toISOString(),
    expiresAt: input.expiresAt || '',
    maxUses: input.maxUses ?? (role === 'super_admin' ? 999 : 50),
    usedCount,
    isActive,
    note: input.note?.trim() || '',
    groupName: input.groupName?.trim() || undefined,
    type: input.type ?? typeByRole[role],
    active: isActive,
    usageCount: usedCount,
  };
}

function normalizeInviteRecord(value: Partial<InviteCodeRecord> & Record<string, unknown>): InviteCodeRecord {
  return createInviteRecord({
    code: typeof value.code === 'string' ? value.code : '',
    role: isInviteRole(value.role) ? value.role : undefined,
    type: isInviteType(value.type) ? value.type : undefined,
    usedCount: typeof value.usedCount === 'number' ? value.usedCount : undefined,
    usageCount: typeof value.usageCount === 'number' ? value.usageCount : undefined,
    clubId: typeof value.clubId === 'string' ? value.clubId : undefined,
    groupName: typeof value.groupName === 'string' ? value.groupName : undefined,
    maxUses: typeof value.maxUses === 'number' ? value.maxUses : undefined,
    expiresAt: typeof value.expiresAt === 'string' ? value.expiresAt : undefined,
    isActive: typeof value.isActive === 'boolean' ? value.isActive : undefined,
    active: typeof value.active === 'boolean' ? value.active : undefined,
    createdBy: typeof value.createdBy === 'string' ? value.createdBy : undefined,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : undefined,
    note: typeof value.note === 'string' ? value.note : undefined,
  });
}

function validateInviteRecord(record: InviteCodeRecord | undefined, expectedRole?: InviteRole): InviteValidationResult {
  if (!record) return { valid: false, message: 'Davet kodu geçersiz.' };
  if (!record.isActive) return { valid: false, message: 'Davet kodu pasif.', record };
  if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) return { valid: false, message: 'Davet kodunun süresi dolmuş.', record };
  if (record.maxUses > 0 && record.usedCount >= record.maxUses) return { valid: false, message: 'Davet kodu kullanım limiti dolmuş.', record };
  if (expectedRole && record.role !== expectedRole) return { valid: false, message: 'Bu kod seçilen rol için geçerli değildir.', record };
  if (record.role !== 'super_admin' && !record.clubId) return { valid: false, message: 'Davet kodu kulüp bilgisi içermiyor.', record };
  return { valid: true, record };
}

function generateReadableCode(clubId: string | undefined, role: InviteRole) {
  const club = inviteClubs.find((item) => item.id === clubId) ?? inviteClubs[2];
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return normalizeCode(`${club.codePrefix}-${roleCodePart[role]}-${suffix}`);
}

function upsertInviteRecord(record: InviteCodeRecord) {
  inviteCodes = [record, ...inviteCodes.filter((item) => item.code !== record.code)];
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

async function syncInviteCode(record: InviteCodeRecord) {
  await writeRootDocument('inviteCodes', record.code, record as unknown as Record<string, unknown>);
}

function isInviteRole(value: unknown): value is InviteRole {
  return value === 'athlete' || value === 'parent' || value === 'coach' || value === 'club_admin' || value === 'super_admin';
}

function isInviteType(value: unknown): value is InviteCodeType {
  return value === 'club' || value === 'coach' || value === 'athlete' || value === 'parent';
}

// Firestore structure:
// inviteCodes/{code}
// { code, clubId, clubName, role, createdBy, createdAt, expiresAt, maxUses, usedCount, isActive, note }
// Security rules should allow only single-code validation for normal users and full listing for super_admin.
