import { MinioStorageService } from '../minio/minio.service.js';
import { StorageModuleOptions } from './storage.options.js';
import { FILE_STORAGE, STORAGE_OPTIONS } from './tokens/storage.token.js';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

/**
 * Storage module (dynamic)
 *
 * WHY:
 * - Supports runtime configuration
 * - Enables multiple environments
 * - Avoids hardcoded env usage
 */
@Global()
@Module({})
export class StorageModule {
  static forRoot(options: StorageModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: STORAGE_OPTIONS,
      useValue: options,
    };

    const storageProvider: Provider = {
      provide: FILE_STORAGE,
      useClass: MinioStorageService,
    };

    return {
      module: StorageModule,
      providers: [optionsProvider, storageProvider],
      exports: [FILE_STORAGE],
    };
  }
}

