# IndexedDbClient

Простой и мощный клиент для работы с IndexedDB в браузере. Разработан как ORM-подобный интерфейс, который делает операции с IndexedDB интуитивными и типобезопасными.

> 🇺🇸 [Read in English](README.md)

## Возможности

- 🚀 **Простой API** - Интуитивный ORM-подобный интерфейс
- 🔒 **Типобезопасность** - Полная поддержка TypeScript с дженериками
- 📊 **Индексированные запросы** - Поддержка пользовательских индексов и диапазонных запросов
- 🔄 **Promise-based** - Все операции возвращают промисы
- 🎯 **Гибкая конфигурация** - Несколько способов настройки клиента
- 🛡️ **Обработка ошибок** - Комплексная обработка ошибок и валидация

## Установка

```bash
npm install @azarov-serge/indexed-db-client
```

## Быстрый старт

```typescript
import { IndexedDbClient } from '@azarov-serge/indexed-db-client';

// Определите ваши типы
type Task = {
  id: number;
  name: string;
  isDone: boolean;
  createdAt: Date;
};

// Настройте клиент
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

// Создайте и инициализируйте
const client = new IndexedDbClient(config);
await client.init();

// Используйте клиент
const taskId = await client.from('tasks').insert({
  name: 'Изучить IndexedDB',
  isDone: false,
  createdAt: new Date()
});
```

## Содержание

- [Установка](#установка)
- [Быстрый старт](#быстрый-старт)
- [Конфигурация](#конфигурация)
- [Справочник API](#справочник-api)
- [Примеры](#примеры)
- [Продвинутое использование](#продвинутое-использование)
- [Обработка ошибок](#обработка-ошибок)

## Конфигурация

### 1. Определение типов

Сначала определите названия хранилищ и типы данных:

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

// Определите названия индексов для типобезопасности
export type TaskIndexName = 'tasksName' | 'tasksCreatedAt' | 'tasksCategoryId';
export type CategoryIndexName = 'categoriesName';
```

### 2. Создание конфигурации

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

### 3. Инициализация клиента

У вас есть два способа настройки клиента:

**Способ 1: Конфигурация в конструкторе**
```typescript
const client = new IndexedDbClient(indexedDbConfig);
await client.init();
```

**Способ 2: Отдельная конфигурация**
```typescript
const client = new IndexedDbClient();
await client.configure(indexedDbConfig).init();
```

## Справочник API

### Конструктор

```typescript
new IndexedDbClient<StorageName, IndexName>(config?)
```

- `config` (опционально): Начальный объект конфигурации

### Методы

#### `configure(config)`
Настроить клиент после создания экземпляра.

```typescript
client.configure(config).init();
```

#### `init()`
Инициализировать соединение с базой данных.

```typescript
await client.init();
```

#### `from(storageName)`
Выбрать хранилище для работы. Возвращает клиент для цепочки вызовов.

```typescript
client.from('tasks')
```

#### `insert<T>(data)`
Вставить новую запись. Возвращает сгенерированный ID.

```typescript
const id = await client.from('tasks').insert<Task>({
  name: 'Новая задача',
  isDone: false,
  createdAt: new Date()
});
```

#### `select<T>(params?)`
Выбрать записи из хранилища.

```typescript
// Выбрать все записи
const allTasks = await client.from('tasks').select<Task>();

// Выбрать с параметрами
const tasks = await client.from('tasks').select<Task>({
  key: 'tasksName',
  value: 'Название задачи',
  count: 10,
  orderBy: 'desc'
});
```

**Параметры select:**
- `key`: Название индекса или 'id' для первичного ключа
- `value`: Значение для поиска или IDBKeyRange
- `count`: Ограничить количество результатов
- `orderBy`: 'asc' (по умолчанию) или 'desc'

#### `update<T>(data)`
Обновить существующую запись.

```typescript
await client.from('tasks').update<Task>({
  id: 1,
  name: 'Обновленная задача',
  isDone: true,
  createdAt: new Date()
});
```

#### `delete(params)`
Удалить записи по ID или индексу.

```typescript
// Удалить по ID
await client.from('tasks').delete({ key: 'id', value: 1 });

// Удалить по индексу
await client.from('tasks').delete({ 
  key: 'tasksName', 
  value: 'Название задачи' 
});
```

#### `createStorage(storageName)`
Создать новое хранилище (object store).

```typescript
await client.createStorage('newStorage');
```

#### `deleteStorage(storageName)`
Удалить хранилище.

```typescript
await client.deleteStorage('tasks');
```

#### `deleteDb()`
Удалить всю базу данных.

```typescript
await client.deleteDb();
```

### Свойства

#### `isInited`
Проверить, инициализирован ли клиент.

```typescript
if (client.isInited) {
  // Клиент готов к использованию
}
```

## Примеры

### Базовые CRUD операции

```typescript
import { IndexedDbClient } from '@azarov-serge/indexed-db-client';

// Настройка
const client = new IndexedDbClient(config);
await client.init();

// Создание
const taskId = await client.from('tasks').insert({
  name: 'Изучить TypeScript',
  isDone: false,
  createdAt: new Date()
});

// Чтение
const task = await client.from('tasks').select<Task>({ 
  key: 'id', 
  value: taskId 
});

// Обновление
await client.from('tasks').update({
  id: taskId,
  name: 'Изучить TypeScript (Обновлено)',
  isDone: true,
  createdAt: new Date()
});

// Удаление
await client.from('tasks').delete({ key: 'id', value: taskId });
```

### Продвинутые запросы

```typescript
// Выбрать все задачи, отсортированные по дате создания (новые сначала)
const recentTasks = await client
  .from('tasks')
  .select<Task>({ orderBy: 'desc' });

// Выбрать первые 5 задач
const firstFive = await client
  .from('tasks')
  .select<Task>({ count: 5 });

// Выбрать задачи по названию
const tasksByName = await client
  .from('tasks')
  .select<Task>({ 
    key: 'tasksName', 
    value: 'Изучить TypeScript' 
  });

// Выбрать задачи, созданные после определенной даты
const recentTasks = await client
  .from('tasks')
  .select<Task>({
    key: 'tasksCreatedAt',
    value: IDBKeyRange.lowerBound(new Date('2024-01-01'))
  });

// Выбрать задачи в диапазоне дат
const tasksInRange = await client
  .from('tasks')
  .select<Task>({
    key: 'tasksCreatedAt',
    value: IDBKeyRange.bound(
      new Date('2024-01-01'),
      new Date('2024-12-31')
    )
  });

// Выбрать задачи по категории
const tasksByCategory = await client
  .from('tasks')
  .select<Task>({
    key: 'tasksCategoryId',
    value: 1
  });
```

### Работа с несколькими хранилищами

```typescript
// Вставить категорию
const categoryId = await client.from('categories').insert({
  name: 'Работа',
  color: '#ff0000'
});

// Вставить задачу с категорией
const taskId = await client.from('tasks').insert({
  name: 'Завершить проект',
  isDone: false,
  createdAt: new Date(),
  categoryId: categoryId
});

// Получить все категории
const categories = await client.from('categories').select<Category>();

// Получить задачи по категории
const workTasks = await client
  .from('tasks')
  .select<Task>({
    key: 'tasksCategoryId',
    value: categoryId
  });
```

### Обработка ошибок

```typescript
try {
  await client.init();
  
  const taskId = await client.from('tasks').insert({
    name: 'Задача',
    isDone: false,
    createdAt: new Date()
  });
  
  console.log('Задача создана с ID:', taskId);
} catch (error) {
  console.error('Ошибка:', error);
  
  if (error instanceof Error) {
    switch (error.message) {
      case 'Config is not exist':
        console.error('Клиент не настроен');
        break;
      case 'DB is not init':
        console.error('База данных не инициализирована');
        break;
      case 'No storage selected':
        console.error('Хранилище не выбрано');
        break;
      default:
        console.error('Неизвестная ошибка:', error.message);
    }
  }
}
```

## Продвинутое использование

### Пользовательские индексы

```typescript
// Создать уникальный индекс
const config = {
  // ... остальная конфигурация
  storeNameToIndexes: {
    users: [
      { index: 'usersEmail', key: 'email', unique: true },
      { index: 'usersUsername', key: 'username', unique: true }
    ]
  }
};

// Использовать уникальный индекс
const user = await client
  .from('users')
  .select<User>({ 
    key: 'usersEmail', 
    value: 'user@example.com' 
  });
```

### Версионирование базы данных

```typescript
// Увеличить версию для запуска обновлений схемы
const config = {
  dbName: 'myApp',
  dbVersion: 2, // Увеличено с 1
  // ... остальная конфигурация
};

// Клиент автоматически обработает миграции схемы
await client.init();
```

### Массовые операции

```typescript
// Вставить несколько записей
const tasks = [
  { name: 'Задача 1', isDone: false, createdAt: new Date() },
  { name: 'Задача 2', isDone: false, createdAt: new Date() },
  { name: 'Задача 3', isDone: false, createdAt: new Date() }
];

const ids = await Promise.all(
  tasks.map(task => client.from('tasks').insert(task))
);

// Удалить несколько записей
await Promise.all(
  ids.map(id => client.from('tasks').delete({ key: 'id', value: id }))
);
```

## Поддержка браузеров

Эта библиотека работает во всех современных браузерах, поддерживающих IndexedDB:

- Chrome 23+
- Firefox 16+
- Safari 10+
- Edge 12+
- Internet Explorer 10+

## Лицензия

MIT

## Вклад в проект

Вклады приветствуются! Пожалуйста, не стесняйтесь отправлять Pull Request.

---

> 🇺🇸 [Read in English](README.md) 
