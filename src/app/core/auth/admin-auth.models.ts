export const AUTHORIZED_ADMIN_USER_ID = '21fbb14d-8e11-4166-b320-639d8a7cb4df';

export type AdminAuthErrorCode = 'invalid-credentials' | 'unauthorized' | 'unavailable';

export type AdminAuthResult = { ok: true } | { ok: false; code: AdminAuthErrorCode };
