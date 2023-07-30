export interface StorageIndex<I> {
	index: I;
	key: string;
	unique?: boolean;
}

export interface IndexedDbconfig<S, I> {
	dbName: string;
	dbVersion?: number | undefined;
	storageNames: S[];
	storeNameToIndexeses: Record<string, StorageIndex<I>[]>;
}

export interface SelectParams<I> {
	key?: I | 'id';
	value?: IDBKeyRange | any;
	count?: number;
}
