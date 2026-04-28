import { FileStorage } from '../storage/storage.interfaces.js';
import { StorageModuleOptions } from '../storage/storage.options.js';
import { STORAGE_OPTIONS } from '../storage/tokens/storage.token.js';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Readable } from 'stream';

/**
 * MinIO-based storage service (S3 compatible)
 *
 * WHY:
 * - Uses DI-based config instead of process.env
 * - Fully testable & environment-independent
 * - Compatible with AWS S3 and MinIO
 */
@Injectable()
export class MinioStorageService implements FileStorage {
  private readonly client: S3Client;
  private readonly logger = new Logger(MinioStorageService.name);

  constructor(
    @Inject(STORAGE_OPTIONS)
    private readonly options: StorageModuleOptions,
  ) {
    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: options.forcePathStyle ?? true,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
  }

  private buildPublicUrl(key: string): string {
    return `${this.options.publicUrl}/${this.options.bucket}/${key}`;
  }

  /**
   * Upload file directly via backend
   */
  async upload(params: { key: string; buffer: Uint8Array; contentType: string }): Promise<string> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.options.bucket,
          Key: params.key,
          Body: params.buffer,
          ContentType: params.contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );

      return this.buildPublicUrl(params.key);
    } catch (error) {
      this.logger.error('Upload failed', error);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  /**
   * Delete file
   */
  async delete(params: { key: string }): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.options.bucket,
          Key: params.key,
        }),
      );
    } catch (error) {
      this.logger.error('Delete failed', error);
      throw new InternalServerErrorException('File deletion failed');
    }
  }

  /**
   * Generate presigned upload URL
   *
   * WHY:
   * - Client uploads directly → no backend bandwidth usage
   */
  async getSignedUploadUrl(params: { key: string; contentType: string }): Promise<{
    uploadUrl: string;
    fileUrl: string;
  }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.options.bucket,
        Key: params.key,
        ContentType: params.contentType,
      });

      const uploadUrl = await getSignedUrl(this.client, command, {
        expiresIn: this.options.linkTTL,
      });

      return {
        uploadUrl,
        fileUrl: this.buildPublicUrl(params.key),
      };
    } catch (error) {
      this.logger.error('Signed upload URL failed', error);
      throw new InternalServerErrorException('Failed to create upload URL');
    }
  }

  async get(params: { key: string }): Promise<Buffer> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.options.bucket,
          Key: params.key,
        }),
      );

      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];

      return await new Promise((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error('Get object failed', error);
      throw new InternalServerErrorException('File download failed');
    }
  }

  /**
   * Generate presigned download URL
   */
  async getSignedDownloadUrl(params: { key: string }): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.options.bucket,
        Key: params.key,
      });

      return await getSignedUrl(this.client, command, {
        expiresIn: this.options.linkTTL,
      });
    } catch (error) {
      this.logger.error('Signed download URL failed', error);
      throw new InternalServerErrorException('Failed to create download URL');
    }
  }

  getPublicUrl(params: { key: string }): string {
    return this.buildPublicUrl(params.key);
  }
}
