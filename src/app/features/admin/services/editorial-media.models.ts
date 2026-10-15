export type EditorialMediaPurpose = 'project_image' | 'skill_icon' | 'curriculum' | 'profile_image';
export type EditorialUploadMime = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/svg+xml' | 'application/pdf';
export type EditorialMediaStatus = 'pending' | 'ready' | 'rejected' | 'deleting';

export interface EditorialMediaReservation {
  mediaId: string;
  bucket: string;
  path: string;
  expectedRevision: number;
}

export const EDITORIAL_IMAGE_MAX_BYTES = 1_048_576;
export const EDITORIAL_PROFILE_IMAGE_MAX_BYTES = 3_145_728;

export function validateEditorialUpload(
  purpose: EditorialMediaPurpose,
  mime: string,
  bytes: number,
): mime is EditorialUploadMime {
  if (!Number.isSafeInteger(bytes) || bytes <= 0) return false;
  if (purpose === 'curriculum') return mime === 'application/pdf';
  if (purpose === 'profile_image') {
    return (mime === 'image/png' || mime === 'image/jpeg' || mime === 'image/webp') && bytes <= EDITORIAL_PROFILE_IMAGE_MAX_BYTES;
  }
  return (mime === 'image/png' || mime === 'image/jpeg' || (purpose === 'skill_icon' && mime === 'image/svg+xml')) && bytes <= EDITORIAL_IMAGE_MAX_BYTES;
}
