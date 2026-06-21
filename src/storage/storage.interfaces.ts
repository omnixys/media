import type { Readable } from 'node:stream';

export type StorageBody = AsyncIterable<Uint8Array> | Readable;

export interface StorageOperationOptions {
  readonly signal?: AbortSignal;
}

export interface MultipartUploadPart {
  readonly partNumber: number;
  readonly etag: string;
}

export interface MultipartUploadHandle {
  readonly key: string;
  readonly uploadId: string;
}

export interface StorageHealth {
  readonly healthy: boolean;
  readonly status: 'closed' | 'ready' | 'unavailable';
  readonly latencyMs?: number;
  readonly error?: string;
}

export interface FileStorage {
  upload(params: {
    key: string;
    buffer: Uint8Array;
    contentType: string;
    signal?: AbortSignal;
  }): Promise<string>;

  uploadStream(params: {
    key: string;
    body: StorageBody;
    contentType: string;
    contentLength?: number;
    signal?: AbortSignal;
  }): Promise<string>;

  uploadMultipart(params: {
    key: string;
    body: StorageBody;
    contentType: string;
    partSizeBytes?: number;
    signal?: AbortSignal;
  }): Promise<string>;

  createMultipartUpload(params: {
    key: string;
    contentType: string;
    signal?: AbortSignal;
  }): Promise<MultipartUploadHandle>;

  uploadPart(
    params: MultipartUploadHandle & {
      partNumber: number;
      body: Uint8Array;
      signal?: AbortSignal;
    },
  ): Promise<MultipartUploadPart>;

  completeMultipartUpload(
    params: MultipartUploadHandle & {
      parts: readonly MultipartUploadPart[];
      signal?: AbortSignal;
    },
  ): Promise<string>;

  abortMultipartUpload(
    params: MultipartUploadHandle & StorageOperationOptions,
  ): Promise<void>;

  delete(params: { key: string; signal?: AbortSignal }): Promise<void>;
  get(params: { key: string; signal?: AbortSignal }): Promise<Buffer>;
  getStream(params: { key: string; signal?: AbortSignal }): Promise<Readable>;

  getSignedUploadUrl(params: {
    key: string;
    contentType: string;
    signal?: AbortSignal;
  }): Promise<{ uploadUrl: string; fileUrl: string }>;
  getSignedDownloadUrl(params: {
    key: string;
    signal?: AbortSignal;
  }): Promise<string>;
  getPublicUrl(params: { key: string }): string;

  health(options?: StorageOperationOptions): Promise<StorageHealth>;
  status(): 'closed' | 'closing' | 'ready';
  diagnostics(): Readonly<Record<string, unknown>>;
  drain(timeoutMs?: number): Promise<void>;
  close(): Promise<void>;
  shutdown(): Promise<void>;
}
