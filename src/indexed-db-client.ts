import { IDBConfig, SelectParams } from './types';

export class IndexedDbClient<IDBStorageName, IDBIndex> {
  private db: IDBDatabase | null = null;
  private storageName: IDBStorageName | null = null;
  private config: IDBConfig<IDBStorageName, IDBIndex> | null = null;
  private _isInited: boolean = false;

  constructor(config?: IDBConfig<IDBStorageName, IDBIndex>) {
    if (config) {
      this.config = config;
    }
  }

  get isInited(): boolean {
    return this._isInited;
  }

  public configure = (config: IDBConfig<IDBStorageName, IDBIndex>): this => {
    this.config = config;

    return this;
  };

  public init = async (): Promise<void> => {
    if (this.config === null) {
      throw new Error('Config is not exist');
    }

    const { dbName, dbVersion, storageNames } = this.config;

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
            if (this.db && !this.db.objectStoreNames.contains(storageName as string)) {
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

    const indexes = this.config?.storeNameToIndexes[storageName as string] || [];

    indexes.forEach(({ index, key, unique = false }) => {
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

    const { key, value, count, orderBy } = params || {};

    const isStorage = !params || key === 'id' || (params && (count || orderBy));
    const storage = isStorage
      ? this.getStorage('readonly')
      : this.getStorage('readonly').index(`${key ?? ''}`);

    if (orderBy !== 'desc') {
      const request = storage.getAll(value, count);

      return this.promisifyRequest<T[]>(request, config);
    }

    const values: T[] = [];
    let step = 0;

    const request = storage.openCursor(value, 'prev');

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const isNeedStep = count && step ? step - count : true;
        if (isNeedStep && request && request.result) {
          const result = request.result;
          values.push(result.value);
          step++;
          result.continue();
        } else {
          step = count ? count : step;
          this.clearStorageName();

          resolve(values);
        }
      };

      request.onerror = (error) => {
        this.clearStorageName();
        reject(error);
      };
    });
  };

  public insert = async <T>(element: T): Promise<number> => {
    const request = this.getStorage('readwrite').put(element) as unknown as IDBRequest<number>;

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
      const index = storage.index(`${key ?? ''}`);
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

    value && (await storage.delete(value));
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
        reject('Could not delete database');
      };
      request.onblocked = function () {
        reject('Could not delete database due to the operation being blocked');
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

  private promisifyRequest = <T>(
    request: IDBRequest<T>,
    config?: {
      defaultValue?: T;
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
    }
  ): Promise<T> => {
    const { defaultValue, onSuccess, onError } = config || {};
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        onSuccess && onSuccess(request.result as T);

        if (!request.result && defaultValue) {
          resolve(defaultValue || (request.result as T));
        }

        resolve(request.result as T);
      };

      request.onerror = (error) => {
        onError && onError(error);
        reject(error);
      };
    });
  };
}
