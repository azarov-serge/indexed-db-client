import { StorageIndex } from '../indexed-db.types';
import { StorageIndexName, StorageName, TasksKey } from './example.types';

export const DB_NAME = 'exampleIndexedDbClientDb';
export const DB_VERSION = 1;

export const storageNames: StorageName[] = ['tasks'];

export const storeNameToIndexeses: Record<
	StorageName,
	StorageIndex<StorageIndexName>[]
> = {
	tasks: [
		{ index: 'tasksName', key: 'name' },
		{ index: 'tasksCreatedAt', key: 'createdAt' },
	],
};

export const indexedDbConfig = {
	dbName: DB_NAME,
	dbVersion: DB_VERSION,
	storageNames,
	storeNameToIndexeses,
};
