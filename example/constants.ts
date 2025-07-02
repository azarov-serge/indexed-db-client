import { IDBConfig, StorageIndex } from '../src/types';
import { StorageIndexName, StorageName } from './types';

export const DB_NAME = 'exampleIndexedDbClientDb';
export const DB_VERSION = 1;

export const storageNames: StorageName[] = ['tasks'];

export const storeNameToIndexes: Record<
  StorageName,
  StorageIndex<StorageIndexName>[]
> = {
  tasks: [
    { index: 'tasksName', key: 'name' },
    { index: 'tasksCreatedAt', key: 'createdAt' },
  ],
};

export const indexedDbConfig: IDBConfig<StorageName, StorageIndexName> = {
  dbName: DB_NAME,
  dbVersion: DB_VERSION,
  storageNames,
  storeNameToIndexes,
};
