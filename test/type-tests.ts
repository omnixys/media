import type { FileStorage, StorageModuleOptions } from '../src/index.js';

const legacyOptions: StorageModuleOptions = {
  region: 'eu-central-1',
  endpoint: 'https://storage.example.com',
  accessKeyId: 'access',
  secretAccessKey: 'secret',
  bucket: 'media',
  linkTTL: 900,
  publicUrl: 'https://cdn.example.com',
};
void legacyOptions;

declare const storage: FileStorage;
const stream = storage.getStream({
  key: 'file.bin',
  signal: new AbortController().signal,
});
void stream;
void storage.uploadMultipart({
  key: 'file.bin',
  body: (async function* () {
    yield new Uint8Array();
  })(),
  contentType: 'application/octet-stream',
});
