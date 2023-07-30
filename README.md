# IndexedDbClient

- [Types](#types)
- [Create storage](#create-storage)
- [Constants (config)](#constants-config)
- [Configure + init v1](#configure--init-v1)
- [Configure + init v2](#configure--init-v2)
- [Add record](#add-record)
- [Update record](#update-record)
- [Select records](#select-records)
  - [Select all records](#select-all-records)
  - [Select all records (count)](#select-all-records-counts)
  - [Select by id](#select-by-id)
  - [Select by index (key)](#select-by-index-key)
  - [Select by range)](#select-by-range)
- [Delete record](#delete-record)
  - [Delete by id](#delete-by-id)
  - [Delete by index (key)](#delete-by-index-key)
- [Delete DB](#delete-db)
- [Storages (delete, create)](#storages-delete-create)
  - [Delete storage](#delete-storage)
  - [Create storage](#create-storage)

## Types

Add types for DB and stores. File **example.types.ts**

```typescript
export type StorageName = 'tasks';
export type TasksKey = 'createdAt' | 'name';
export type StorageIndexName = `tasks${Capitalize<TasksKey>}`;

type Id = number;

export interface Task {
	id: Id;
	name: string;
	isDone: boolean;
	createdAt: Date;
}
```

## Constants (config)

Add config. File **example.constants.ts**

```typescript
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
```

## Configure + init v1

```typescript
export const indexedDbClient = new IndexedDbClient(indexedDbConfig);
```

Configure and initial client

```typescript
const startExample = async () => {
	export const indexedDbClient = new IndexedDbClient(indexedDbConfig);
	await indexedDbClient.init();
};
```

## Configure + init v2

```typescript
export const indexedDbClient = new IndexedDbClient();
indexedDbClient.configure(indexedDbConfig);
```

Configure and initial client

```typescript
const startExample = async () => {
	export const indexedDbClient = new IndexedDbClient();
	await indexedDbClient.configure(indexedDbConfig).init();
};
```

## Add record

```typescript
const taskData = {
	name: 'Task #1',
	isDone: false,
	createdAt: new Date(),
};

const id = await indexedDbClient
	.from('tasks')
	.insert<Omit<Task, 'id'>>(taskData);

const createdTask: Task = {
	id,
	...taskData,
};
```

## Update record

```typescript
const updatedTask = {
	...createdTask,
	name: 'Task #2',
};

await indexedDbClient.from('tasks').update<Task>(updatedTask);
```

## Select records

### Select all records

```typescript
const allTasks = await indexedDbClient.from('tasks').select<Task>();
```

### Select all records (counts)

```typescript
const fiveTasks = await indexedDbClient
	.from('tasks')
	.select<Task>({ count: 5 });
```

### Select by id

```typescript
const [foundedByIdTask] = await indexedDbClient
	.from('tasks')
	.select<Task>({ key: 'id', value: 1 });
```

### Select by index (key)

```typescript
const [foundedByIndexTask] = await indexedDbClient
	.from('tasks')
	.select<Task>({ key: 'tasksName', value: 'Task #2' });
```

### Select by range

```typescript
const [foundedByRangeTask] = await indexedDbClient.from('tasks').select<Task>({
	key: 'tasksCreatedAt',
	value: IDBKeyRange.lowerBound(new Date()),
});
```

### Select by range

```typescript
const foundedByRangeAndCountTasks = await indexedDbClient
	.from('tasks')
	.select<Task>({
		key: 'tasksCreatedAt',
		value: IDBKeyRange.lowerBound(new Date()),
		count: 5,
	});
```

## Delete record

### Delete by id

```typescript
await indexedDbClient.from('tasks').delete({ key: 'id', value: 1 });
```

### Delete by index (key)

```typescript
await indexedDbClient
	.from('tasks')
	.delete({ key: 'tasksName', value: 'Updated task #1' });
```

## Delete DB

```typescript
await indexedDbClient.deleteDb();
```

## Storages (delete, create)

### Delete storage

```typescript
await indexedDbClient.deleteStorage('tasks');
```

### Create storage

```typescript
await indexedDbClient.createStorage('tasks');
```
