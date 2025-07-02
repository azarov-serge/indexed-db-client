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
