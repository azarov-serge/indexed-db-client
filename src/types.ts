export type StorageIndex<I> = {
  index: I;
  key: string;
  unique?: boolean;
};

export type IDBConfig<S, I> = {
  dbName: string;
  dbVersion?: number | undefined;
  storageNames: S[];
  /** need for search by index */
  storeNameToIndexes: Record<string, StorageIndex<I>[]>;
};

export type SelectParams<I> = {
  key?: I | 'id';
  value?: IDBKeyRange | number | string;
  count?: number;
  orderBy?: 'asc' | 'desc';
};
