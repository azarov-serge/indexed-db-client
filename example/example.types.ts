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
