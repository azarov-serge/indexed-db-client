# IndexedDbClient

A simple and powerful IndexedDB client for working with IndexedDB in the browser. Designed as an ORM-like interface that makes IndexedDB operations intuitive and type-safe.

> 🇷🇺 [Читать на русском языке](README_RU.md)

## Features

- 🚀 **Simple API** - Intuitive ORM-like interface
- 🔒 **Type Safety** - Full TypeScript support with generics
- 📊 **Indexed Queries** - Support for custom indexes and range queries
- 🔄 **Promise-based** - All operations return promises
- 🎯 **Flexible Configuration** - Multiple ways to configure the client
- 🛡️ **Error Handling** - Comprehensive error handling and validation

## Installation

```bash
npm install @azarov-serge/indexed-db-client
```

## Quick Start

```typescript
import { IndexedDbClient } from '@azarov-serge/indexed-db-client';

// Define your types
type Task = {
  id: number;
  name: string;
  isDone: boolean;
  createdAt: Date;
};

// Configure the client
const config = {
  dbName: 'myApp',
  dbVersion: 1,
  storageNames: ['tasks'] as const,
  storeNameToIndexes: {
    tasks: [
      { index: 'tasksName', key: 'name' },
      { index: 'tasksCreatedAt', key: 'createdAt' }
    ]
  }
};

// Create and initialize
const client = new IndexedDbClient(config);
await client.init();

// Use the client
const taskId = await client.from('tasks').insert({
  name: 'Learn IndexedDB',
  isDone: false,
  createdAt: new Date()
});
```

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)
- [Error Handling](#error-handling)

## Configuration

### 1. Define Types

First, define your storage names and data types:

```typescript
// types.ts
export type StorageName = 'tasks' | 'categories';

export type Task = {
  id: number;
  name: string;
  isDone: boolean;
  createdAt: Date;
  categoryId?: number;
};

export type Category = {
  id: number;
  name: string;
  color: string;
};

// Define index names for type safety
export type TaskIndexName = 'tasksName' | 'tasksCreatedAt' | 'tasksCategoryId';
export type CategoryIndexName = 'categoriesName';
```

### 2. Create Configuration

```typescript
// config.ts
import { IDBConfig } from '@azarov-serge/indexed-db-client';
import { StorageName, TaskIndexName, CategoryIndexName } from './types';

export const indexedDbConfig: IDBConfig<StorageName, TaskIndexName | CategoryIndexName> = {
  dbName: 'myApp',
  dbVersion: 1,
  storageNames: ['tasks', 'categories'],
  storeNameToIndexes: {
    tasks: [
      { index: 'tasksName', key: 'name' },
      { index: 'tasksCreatedAt', key: 'createdAt' },
      { index: 'tasksCategoryId', key: 'categoryId' }
    ],
    categories: [
      { index: 'categoriesName', key: 'name', unique: true }
    ]
  }
};
```

### 3. Initialize Client

You have two ways to configure the client:

**Method 1: Constructor Configuration**
```typescript
const client = new IndexedDbClient(indexedDbConfig);
await client.init();
```

**Method 2: Separate Configuration**
```typescript
const client = new IndexedDbClient();
await client.configure(indexedDbConfig).init();
```

## API Reference

### Constructor

```typescript
new IndexedDbClient<StorageName, IndexName>(config?)
```

- `config` (optional): Initial configuration object

### Methods

#### `configure(config)`
Configure the client after instantiation.

```typescript
client.configure(config).init();
```

#### `init()`
Initialize the database connection.

```typescript
await client.init();
```

#### `from(storageName)`
Select a storage to work with. Returns the client for chaining.

```typescript
client.from('tasks')
```

#### `insert<T>(data)`
Insert a new record. Returns the generated ID.

```typescript
const id = await client.from('tasks').insert<Task>({
  name: 'New Task',
  isDone: false,
  createdAt: new Date()
});
```

#### `select<T>(params?)`
Select records from storage.

```typescript
// Select all records
const allTasks = await client.from('tasks').select<Task>();

// Select with parameters
const tasks = await client.from('tasks').select<Task>({
  key: 'tasksName',
  value: 'Task Name',
  count: 10,
  orderBy: 'desc'
});
```

**Select Parameters:**
- `key`: Index name or 'id' for primary key
- `value`: Value to search for or IDBKeyRange
- `count`: Limit number of results
- `orderBy`: 'asc' (default) or 'desc'

#### `update<T>(data)`
Update an existing record.

```typescript
await client.from('tasks').update<Task>({
  id: 1,
  name: 'Updated Task',
  isDone: true,
  createdAt: new Date()
});
```

#### `delete(params)`
Delete records by ID or index.

```typescript
// Delete by ID
await client.from('tasks').delete({ key: 'id', value: 1 });

// Delete by index
await client.from('tasks').delete({ 
  key: 'tasksName', 
  value: 'Task Name' 
});
```

#### `createStorage(storageName)`
Create a new storage (object store).

```typescript
await client.createStorage('newStorage');
```

#### `deleteStorage(storageName)`
Delete a storage.

```typescript
await client.deleteStorage('tasks');
```

#### `deleteDb()`
Delete the entire database.

```typescript
await client.deleteDb();
```

### Properties

#### `isInited`
Check if the client is initialized.

```typescript
if (client.isInited) {
  // Client is ready to use
}
```

## Examples

### Basic CRUD Operations

```typescript
import { IndexedDbClient } from '@azarov-serge/indexed-db-client';

// Setup
const client = new IndexedDbClient(config);
await client.init();

// Create
const taskId = await client.from('tasks').insert({
  name: 'Learn TypeScript',
  isDone: false,
  createdAt: new Date()
});

// Read
const task = await client.from('tasks').select<Task>({ 
  key: 'id', 
  value: taskId 
});

// Update
await client.from('tasks').update({
  id: taskId,
  name: 'Learn TypeScript (Updated)',
  isDone: true,
  createdAt: new Date()
});

// Delete
await client.from('tasks').delete({ key: 'id', value: taskId });
```

### Advanced Queries

```typescript
// Select all tasks ordered by creation date (newest first)
const recentTasks = await client
  .from('tasks')
  .select<Task>({ orderBy: 'desc' });

// Select first 5 tasks
const firstFive = await client
  .from('tasks')
  .select<Task>({ count: 5 });

// Select tasks by name
const tasksByName = await client
  .from('tasks')
  .select<Task>({ 
    key: 'tasksName', 
    value: 'Learn TypeScript' 
  });

// Select tasks created after a specific date
const recentTasks = await client
  .from('tasks')
  .select<Task>({
    key: 'tasksCreatedAt',
    value: IDBKeyRange.lowerBound(new Date('2024-01-01'))
  });

// Select tasks in a date range
const tasksInRange = await client
  .from('tasks')
  .select<Task>({
    key: 'tasksCreatedAt',
    value: IDBKeyRange.bound(
      new Date('2024-01-01'),
      new Date('2024-12-31')
    )
  });

// Select tasks by category
const tasksByCategory = await client
  .from('tasks')
  .select<Task>({
    key: 'tasksCategoryId',
    value: 1
  });
```

### Working with Multiple Storages

```typescript
// Insert category
const categoryId = await client.from('categories').insert({
  name: 'Work',
  color: '#ff0000'
});

// Insert task with category
const taskId = await client.from('tasks').insert({
  name: 'Complete project',
  isDone: false,
  createdAt: new Date(),
  categoryId: categoryId
});

// Get all categories
const categories = await client.from('categories').select<Category>();

// Get tasks by category
const workTasks = await client
  .from('tasks')
  .select<Task>({
    key: 'tasksCategoryId',
    value: categoryId
  });
```

### Error Handling

```typescript
try {
  await client.init();
  
  const taskId = await client.from('tasks').insert({
    name: 'Task',
    isDone: false,
    createdAt: new Date()
  });
  
  console.log('Task created with ID:', taskId);
} catch (error) {
  console.error('Error:', error);
  
  if (error instanceof Error) {
    switch (error.message) {
      case 'Config is not exist':
        console.error('Client not configured');
        break;
      case 'DB is not init':
        console.error('Database not initialized');
        break;
      case 'No storage selected':
        console.error('No storage selected');
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

## Advanced Usage

### Custom Indexes

```typescript
// Create unique index
const config = {
  // ... other config
  storeNameToIndexes: {
    users: [
      { index: 'usersEmail', key: 'email', unique: true },
      { index: 'usersUsername', key: 'username', unique: true }
    ]
  }
};

// Use unique index
const user = await client
  .from('users')
  .select<User>({ 
    key: 'usersEmail', 
    value: 'user@example.com' 
  });
```

### Database Versioning

```typescript
// Increment version to trigger schema updates
const config = {
  dbName: 'myApp',
  dbVersion: 2, // Increased from 1
  // ... rest of config
};

// The client will automatically handle schema migrations
await client.init();
```

### Bulk Operations

```typescript
// Insert multiple records
const tasks = [
  { name: 'Task 1', isDone: false, createdAt: new Date() },
  { name: 'Task 2', isDone: false, createdAt: new Date() },
  { name: 'Task 3', isDone: false, createdAt: new Date() }
];

const ids = await Promise.all(
  tasks.map(task => client.from('tasks').insert(task))
);

// Delete multiple records
await Promise.all(
  ids.map(id => client.from('tasks').delete({ key: 'id', value: id }))
);
```

## Browser Support

This library works in all modern browsers that support IndexedDB:

- Chrome 23+
- Firefox 16+
- Safari 10+
- Edge 12+
- Internet Explorer 10+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

> 🇷🇺 [Читать на русском языке](README_RU.md)
