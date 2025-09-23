export interface Task {
  id: string;
  title: string;
  completed: boolean;
  deleted: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
  originalOrder?: number; // preserved for restore decisions
}

export interface TitleValidationResult {
  valid: boolean; normalized?: string; error?: string;
}

const MAX_TITLE_LENGTH = 200;

export function validateTitle(raw: string): TitleValidationResult {
  const normalized = raw.trim();
  if (!normalized) return { valid: false, error: 'empty' };
  if (normalized.length > MAX_TITLE_LENGTH) return { valid: false, error: 'too_long' };
  return { valid: true, normalized };
}
