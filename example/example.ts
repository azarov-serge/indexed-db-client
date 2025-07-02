import { IndexedDbClient } from '../src/indexed-db-client';
import { indexedDbConfig } from './constants';
import { Task } from './types';

// v1: Configure
export const indexedDbClient = new IndexedDbClient(indexedDbConfig);

// v2: Configure. Part 1
// export const indexedDbClient = new IndexedDbClient();

export const startExample = async () => {
  // v2: Configure. Part 2
  // indexedDbClient.configure(indexedDbConfig);

  // Init client
  await indexedDbClient.init();

  // Add record
  const taskData1 = {
    name: 'Task #1',
    isDone: false,
    createdAt: new Date(),
  };

  const id1 = await indexedDbClient
    .from('tasks')
    .insert<Omit<Task, 'id'>>(taskData1);

  const createdTask1: Task = {
    id: id1,
    ...taskData1,
  };

  const taskData2 = {
    name: 'Task #2',
    isDone: false,
    createdAt: new Date(),
  };

  const id2 = await indexedDbClient
    .from('tasks')
    .insert<Omit<Task, 'id'>>(taskData2);

  const createdTask2: Task = {
    id: id1,
    ...taskData1,
  };

  // Update record
  const updatedTask = {
    ...createdTask1,
    name: 'Updated task #1',
  };

  await indexedDbClient.from('tasks').update<Task>(updatedTask);

  // Select all records
  const allTasks = await indexedDbClient.from('tasks').select<Task>();
  const allDescTasks = await indexedDbClient
    .from('tasks')
    .select<Task>({ orderBy: 'desc' });

  // Select all records (counts)
  const fiveTasks = await indexedDbClient
    .from('tasks')
    .select<Task>({ count: 5 });

  // Select last 5 records
  const lastFiveTasks = await indexedDbClient
    .from('tasks')
    .select<Task>({ count: 5, orderBy: 'desc' });

  // Select by id
  const [foundedByIdTask] = await indexedDbClient
    .from('tasks')
    .select<Task>({ key: 'id', value: 1 });

  // Select by index (key)
  const [foundedByIndexTask] = await indexedDbClient
    .from('tasks')
    .select<Task>({ key: 'tasksName', value: 'Task #2' });

  // Select by range
  const [foundedByRangeTask] = await indexedDbClient
    .from('tasks')
    .select<Task>({
      key: 'tasksCreatedAt',
      value: IDBKeyRange.lowerBound(new Date()),
    });

  // Select by range
  const foundedByRangeAndCountTasks = await indexedDbClient
    .from('tasks')
    .select<Task>({
      key: 'tasksCreatedAt',
      value: IDBKeyRange.lowerBound(new Date()),
      count: 5,
    });

  // Delete by id
  await indexedDbClient.from('tasks').delete({ key: 'id', value: 1 });

  // Delete by index (key)
  await indexedDbClient
    .from('tasks')
    .delete({ key: 'tasksName', value: 'Updated task #1' });

  // Delete DB
  await indexedDbClient.deleteDb();

  // Delete storage
  await indexedDbClient.deleteStorage('tasks');
  // Create storage
  await indexedDbClient.createStorage('tasks');
};
