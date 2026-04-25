/**
 * Injection tokens for storage module
 *
 * WHY:
 * - Avoids direct class coupling
 * - Enables swapping implementation via DI
 */
export const FILE_STORAGE = Symbol('FILE_STORAGE');
export const STORAGE_OPTIONS = Symbol('STORAGE_OPTIONS');
