import { MinioStorageService } from '../minio/minio.service.js';
import type { StorageModuleOptions } from './storage.options.js';
import { FILE_STORAGE, STORAGE_OPTIONS } from './tokens/storage.token.js';
import {
  type DynamicModule,
  Global,
  Module,
  type ModuleMetadata,
  type Provider,
  type Type,
} from '@nestjs/common';

export interface StorageModuleOptionsFactory {
  createStorageOptions(): StorageModuleOptions | Promise<StorageModuleOptions>;
}

export interface StorageModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: Array<string | symbol | Type<unknown>>;
  useExisting?: Type<StorageModuleOptionsFactory>;
  useClass?: Type<StorageModuleOptionsFactory>;
  useFactory?: (...args: any[]) => StorageModuleOptions | Promise<StorageModuleOptions>;
  extraProviders?: Provider[];
}

@Global()
@Module({})
export class StorageModule {
  static forRoot(options: StorageModuleOptions): DynamicModule {
    return this.create([{ provide: STORAGE_OPTIONS, useValue: options }]);
  }

  static forRootAsync(options: StorageModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      createAsyncOptionsProvider(options),
      ...(options.useClass ? [{ provide: options.useClass, useClass: options.useClass }] : []),
      ...(options.extraProviders ?? []),
    ];
    return this.create(providers, options.imports ?? []);
  }

  private static create(
    optionsProviders: Provider[],
    imports: NonNullable<ModuleMetadata['imports']> = [],
  ): DynamicModule {
    return {
      module: StorageModule,
      imports,
      providers: [
        ...optionsProviders,
        MinioStorageService,
        { provide: FILE_STORAGE, useExisting: MinioStorageService },
      ],
      exports: [STORAGE_OPTIONS, FILE_STORAGE, MinioStorageService],
    };
  }
}

function createAsyncOptionsProvider(options: StorageModuleAsyncOptions): Provider {
  if (options.useFactory) {
    return {
      provide: STORAGE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    };
  }
  const factory = (options.useExisting ?? options.useClass) as
    | Type<StorageModuleOptionsFactory>
    | undefined;
  if (!factory) {
    throw new Error('StorageModule.forRootAsync requires useFactory, useClass, or useExisting');
  }
  return {
    provide: STORAGE_OPTIONS,
    useFactory: (value: StorageModuleOptionsFactory) => value.createStorageOptions(),
    inject: [factory],
  };
}
