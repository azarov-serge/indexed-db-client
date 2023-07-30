import {
	IndexedDbconfig,
	SelectParams,
	StorageIndex,
} from './indexed-db.types';

export class IndexedDbClient<IDBStorageName, IDBIndex> {
	private db: IDBDatabase | null = null;
	private storageName: IDBStorageName | null = null;
	private config: IndexedDbconfig<IDBStorageName, IDBIndex> | null = null;
	private _isInited: boolean = false;

	constructor(config?: IndexedDbconfig<IDBStorageName, IDBIndex>) {
		if (config) {
			this.config = config;
		}
	}

	get isInited(): boolean {
		return this._isInited;
	}

	public configure = (
		config: IndexedDbconfig<IDBStorageName, IDBIndex>
	): this => {
		this.config = config;

		return this;
	};

	public init = async (): Promise<void> => {
		if (this.config === null) {
			throw new Error('Config is not exist');
		}

		const { dbName, dbVersion, storageNames, storeNameToIndexeses } =
			this.config;

		return new Promise((resolve, reject) => {
			const request = window.indexedDB.open(dbName, dbVersion);

			request.onsuccess = () => {
				try {
					this.db = request.result;
					this._isInited = true;

					resolve();
				} catch (error) {
					reject(error);
				}
			};

			request.onupgradeneeded = () => {
				try {
					this.db = request.result;

					storageNames.forEach((storageName) => {
						if (
							this.db &&
							!this.db.objectStoreNames.contains(storageName as string)
						) {
							this.createStorage(storageName);
						}
					});

					this._isInited = true;

					resolve();
				} catch (error) {
					reject(error);
				}
			};

			request.onerror = (error) => reject(error);
		});
	};

	public createStorage = (storageName: IDBStorageName): void => {
		if (!this.db) {
			throw new Error('DB is not init');
		}

		if (this.db.objectStoreNames.contains(storageName as string)) {
			throw new Error('Storage already exists');
		}

		const store = this.db.createObjectStore(storageName as string, {
			keyPath: 'id',
			autoIncrement: true,
		});

		const indexeses =
			this.config?.storeNameToIndexeses[storageName as string] || [];

		indexeses.forEach(({ index, key, unique = false }) => {
			store.createIndex(index as string, key, {
				unique,
			});
		});
	};

	public from(storageName: IDBStorageName): this {
		this.storageName = storageName;

		return this;
	}

	public select = async <T>(params?: SelectParams<IDBIndex>): Promise<T[]> => {
		const config = {
			defaultValue: [],
			onSuccess: this.clearStorageName,
			onError: this.clearStorageName,
		};

		const request = this.getSelectRequest(params, 'readonly');

		return this.promisifyRequest<T[]>(request, config);
	};

	public insert = async <T>(element: T): Promise<number> => {
		const request = this.getStorage('readwrite').put(element);

		return this.promisifyRequest<number>(request, {
			defaultValue: -1,
			onSuccess: this.clearStorageName,
			onError: this.clearStorageName,
		});
	};

	public update = async <T>(element: T): Promise<void> => {
		await this.getStorage('readwrite').put(element);
		this.clearStorageName();
	};

	public delete = async (params: SelectParams<IDBIndex>): Promise<void> => {
		const { key, value } = params;
		const storage = this.getStorage('readwrite');

		const isIndex = key && key !== 'id';
		if (isIndex) {
			const index = storage.index((key as string) || '');
			const cursor = index.openCursor(IDBKeyRange.only(value));
			const promise = new Promise((resolve, reject) => {
				cursor.onsuccess = () => {
					if (cursor.result) {
						cursor.result.delete();
						cursor.result.continue();
					} else {
						this.clearStorageName();

						resolve(cursor.result);
					}
				};

				cursor.onerror = (error) => {
					this.clearStorageName();
					reject(error);
				};
			});

			await promise.then();

			this.clearStorageName();

			return;
		}

		await storage.delete(value);
		this.clearStorageName();
	};

	public deleteDb = async (): Promise<void> => {
		if (this.config === null) {
			throw new Error('Config is not exist');
		}

		const { dbName } = this.config;
		const request = window.indexedDB.deleteDatabase(dbName);

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				this._isInited = false;
				resolve();
			};
			request.onerror = function () {
				reject("Couldn't delete database");
			};
			request.onblocked = function () {
				reject("Couldn't delete database due to the operation being blocked");
			};
		});
	};

	public deleteStorage = async (storageName: IDBStorageName): Promise<void> => {
		if (!this.db) {
			throw new Error('DB is not init');
		}

		if (!this.db.objectStoreNames.contains(storageName as string)) {
			return;
		}

		await this.db.deleteObjectStore(storageName as string);
	};

	private getStorage = (mode?: IDBTransactionMode): IDBObjectStore => {
		if (!this.db) {
			throw new Error('DB is not init');
		}

		if (!this.storageName) {
			throw new Error('No storage selected');
		}

		const transaction = this.db.transaction(this.storageName as string, mode);

		return transaction.objectStore(this.storageName as string);
	};

	private clearStorageName = (): void => {
		this.storageName = null;
	};

	private getSelectRequest = (
		params?: SelectParams<IDBIndex>,
		mode?: IDBTransactionMode
	): IDBRequest<any> => {
		const storage = this.getStorage(mode);

		if (!params) {
			return this.getStorage(mode).getAll();
		}

		const { key, value, count } = params;

		if (!key && !value && count) {
			return this.getStorage(mode).getAll(undefined, count);
		}

		if (key === 'id') {
			return storage.getAll(value, count);
		}

		const index = storage.index((key as string) || '');

		return index.getAll(value, count);
	};

	private promisifyRequest = <T>(
		request: IDBRequest<any>,
		config?: {
			defaultValue?: T;
			onSuccess?: (result: T) => void;
			onError?: (error: any) => void;
		}
	): Promise<T> => {
		const { defaultValue, onSuccess, onError } = config || {};
		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				onSuccess && onSuccess(request.result);

				if (!request.result && defaultValue) {
					resolve(defaultValue || request.result);
				}

				resolve(request.result);
			};

			request.onerror = (error) => {
				onError && onError(error);
				reject(error);
			};
		});
	};
}
