export type StorageItem = {
	[key: string]: any;
};

export type ChangeEvent<T> = (value: T, thisArg?: State) => void;

export type Listeners = {
	[key: string]: Array<ChangeEvent<any>>;
};

export class State {
	storage: Storage;
	key = 'pbbdtm-state-key';
	listeners: Listeners = {};

	constructor(key?: string) {
		this.storage = window.localStorage;
		if (key) {
			this.key = key;
		}
		const data = this.getAll();
		this.setAll(data);
	}

	clear() {
		return this.setAll({});
	}

	getAll(): StorageItem {
		try {
			const data = this.storage.getItem(this.key);
			if (!data) {
				return {};
			}
			const parsed = JSON.parse(data);
			if (typeof parsed !== 'object') {
				return {};
			}
			return parsed;
		} catch (error) {
			return {};
		}
	}

	setAll(data: StorageItem) {
		this.storage.setItem(this.key, JSON.stringify(data));
		return this;
	}

	has(key: string) {
		return key in this.getAll();
	}

	get<T = any>(key: string): T {
		return this.getAll()[key];
	}

	set(key: string, value: any) {
		const data = this.getAll();
		data[key] = value;
		this.dispatch(key, value);
		return this.setAll(data);
	}

	remove(key: string) {
		if (this.has(key)) {
			const data = this.getAll();
			delete data[key];
			this.setAll(data);
		}
		return this;
	}

	dispatch<T>(key: string, value: T) {
		if (key in this.listeners) {
			this.listeners[key].forEach((callback) => callback(value, this));
		}
		return this;
	}

	listen<T>(key: string, callback: ChangeEvent<T>) {
		if (!(key in this.listeners)) {
			this.listeners[key] = [];
		}
		return this.listeners[key].push(callback) - 1;
	}

	unlisten(key: string, index: number) {
		if (!(key in this.listeners)) {
			return;
		}
		this.listeners[key].splice(index, 1);
	}
}

export default new State();
