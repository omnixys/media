/**
 * Storage module configuration options
 *
 * WHY:
 * - Removes direct dependency on process.env
 * - Enables dynamic configuration (multi-env, testing, microservices)
 * - Required for proper NestJS DI architecture
 */
export interface StorageModuleOptions {
  region: string;
  endpoint: string;
  publicEndpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
  linkTTL: number;

  /**
   * Optional S3 compatibility flag (MinIO requires this)
   */
  forcePathStyle?: boolean;
}
