export interface FileStorage {
  upload(params: {
    key: string;
    buffer: Uint8Array;
    contentType: string;
  }): Promise<string>;

  delete(params: { key: string }): Promise<void>;

  get(params: { key: string }): Promise<Buffer>;

  getSignedUploadUrl(params: { key: string; contentType: string }): Promise<{
    uploadUrl: string;
    fileUrl: string;
  }>;

  getSignedDownloadUrl(params: { key: string }): Promise<string>;
}
