/**
 * Compatibility augmentation for consumers that still configure a dedicated
 * public CDN/base URL. New configurations can derive URLs from `endpoint`.
 */
declare module './storage.options.js' {
  interface StorageModuleOptions {
    /** @deprecated Configure endpoint/bucket routing instead. */
    publicUrl?: string;
  }
}

export {};
