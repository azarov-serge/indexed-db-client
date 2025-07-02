# IndexedDbClient
A simple IndexedDB client for working with IndexedDB. Designed as ORM.

## Table of Contents
- [IndexedDbClient](#indexeddbclient)
	- [Table of Contents](#table-of-contents)
	- [Create types for client](#create-types-for-client)
	- [Create configuration (config)](#create-configuration-config)
	- [Configure + initialization. Version#1](#configure--initialization-version1)
	- [Configure + initialization. Version#2](#configure--initialization-version2)
	- [Add a record to storage](#add-a-record-to-storage)
	- [Update a record in storage](#update-a-record-in-storage)
	- [Select records](#select-records)
		- [Select all records](#select-all-records)
		- [Select all records (counts)](#select-all-records-counts)
		- [Select by id](#select-by-id)
		- [Select by index (key)](#select-by-index-key)
		- [Select by range](#select-by-range)
		- [Select by range](#select-by-range-1)
	- [Delete record](#delete-record)
		- [Delete by id](#delete-by-id)
		- [Delete by index (key)](#delete-by-index-key)
	- [Delete DB](#delete-db)
	- [Storages (delete, create)](#storages-delete-create)
		- [Delete storage](#delete-storage)
		- [Create storage](#create-storage)

## Create types for client

Add types for DB and stores. File **example.types.ts**

```typescript
/** you can use several storages 
 * export type StorageName = 'categories' | 'tasks';
*/
export type StorageName = 'tasks';

export type Id = number;

export type Task = {
  id: Id;
  name: string;
  isDone: boolean;
  createdAt: Date;
};

/** Fields available for index search */
export type TasksKey = 'createdAt' | 'name';
/** Index name for search by index */
export type StorageIndexName = `tasks${Capitalize<
  Extract<keyof Task, 'name' | 'createdAt'>
>}`;

```

[to table of contents](#indexeddbclient)

## Create configuration (config)

Create a configuration file (**/example/constants.ts**)

```typescript
import { StorageIndex } from '../indexed-db.types';
import { StorageIndexName, StorageName, TasksKey } from './example.types';

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

export const indexedDbConfig = {
	dbName: DB_NAME,
	dbVersion: DB_VERSION,
	storageNames,
	storeNameToIndexes,
};
```
[to table of contents](#indexeddbclient)

## Configure + initialization. Version#1

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

[to table of contents](#indexeddbclient)

## Configure + initialization. Version#2

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

[to table of contents](#indexeddbclient)

## Add a record to storage

```typescript
type NewTask = Omit<Task, 'id'>;

const taskData: NewTask = {
	name: 'Task #1',
	isDone: false,
	createdAt: new Date(),
};

const id = await indexedDbClient
	.from('tasks')
	.insert<NewTask>(taskData);

const createdTask: Task = {
	id,
	...taskData,
};

```

[to table of contents](#indexeddbclient)

## Update a record in storage

```typescript
const updatedTask = {
	...createdTask,
	name: 'Task #2',
};

await indexedDbClient.from('tasks').update<Task>(updatedTask);
```

[to table of contents](#indexeddbclient)

## Select records

### Select all records

```typescript
const allTasks = await indexedDbClient.from('tasks').select<Task>();
```

[to table of contents](#indexeddbclient)

Select records and order by descending (desc). Default ordered by ascending (asc)

```typescript
const allDeskTasks = await indexedDbClient
	.from('tasks')
	.select<Task>({ orderBy: 'desk' });
```

[to table of contents](#indexeddbclient)

### Select all records (counts)

```typescript
const fiveTasks = await indexedDbClient
	.from('tasks')
	.select<Task>({ count: 5 });
```

Select last 5 records.

```typescript
const allDeskTasks = await indexedDbClient
	.from('tasks')
	.select<Task>({ count: 5, orderBy: 'desk' });
```

[to table of contents](#indexeddbclient)


### Select by id

```typescript
const [foundedByIdTask] = await indexedDbClient
	.from('tasks')
	.select<Task>({ key: 'id', value: 1 });
```

[to table of contents](#indexeddbclient)

### Select by index (key)

```typescript
const [foundedByIndexTask] = await indexedDbClient
	.from('tasks')
	.select<Task>({ key: 'tasksName', value: 'Task #2' });
```

[to table of contents](#indexeddbclient)

### Select by range

```typescript
const [foundedByRangeTask] = await indexedDbClient.from('tasks').select<Task>({
	key: 'tasksCreatedAt',
	value: IDBKeyRange.lowerBound(new Date()),
});
```

[to table of contents](#indexeddbclient)

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

[to table of contents](#indexeddbclient)

## Delete record

### Delete by id

```typescript
await indexedDbClient.from('tasks').delete({ key: 'id', value: 1 });
```

[to table of contents](#indexeddbclient)

### Delete by index (key)

```typescript
await indexedDbClient
	.from('tasks')
	.delete({ key: 'tasksName', value: 'Updated task #1' });
```

[to table of contents](#indexeddbclient)

## Delete DB

```typescript
await indexedDbClient.deleteDb();
```

[to table of contents](#indexeddbclient)

## Storages (delete, create)

### Delete storage

```typescript
await indexedDbClient.deleteStorage('tasks');
```

[to table of contents](#indexeddbclient)


### Create storage

```typescript
await indexedDbClient.createStorage('tasks');
```

[to table of contents](#indexeddbclient)
