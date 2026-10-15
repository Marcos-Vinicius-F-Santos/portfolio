export type EditorialMediaPurpose = 'project_image' | 'skill_icon' | 'curriculum';
export type EditorialUploadMime = 'image/png' | 'image/jpeg' | 'image/svg+xml' | 'application/pdf';
export type EditorialMediaStatus = 'pending' | 'ready' | 'rejected' | 'deleting';

export interface EditorialMediaReservation {
  mediaId: string;
  bucket: string;
  path: string;
  expectedRevision: number;
}

export const EDITORIAL_IMAGE_MAX_BYTES = 1_048_576;

export function validateEditorialUpload(
  purpose: EditorialMediaPurpose,
  mime: string,
  bytes: number,
): mime is EditorialUploadMime {
  if (!Number.isSafeInteger(bytes) || bytes <= 0) return false;
  if (purpose === 'curriculum') return mime === 'application/pdf';
  return (mime === 'image/png' || mime === 'image/jpeg' || (purpose === 'skill_icon' && mime === 'image/svg+xml')) && bytes <= EDITORIAL_IMAGE_MAX_BYTES;
}
