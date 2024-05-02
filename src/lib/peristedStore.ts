import { writable, type Updater } from 'svelte/store';

export default function persistedStore<T>(key: string, value: T) {
	const store = writable(value);

	function update(updater: Updater<typeof value>) {
		store.update((current) => {
			const newValue = updater(current);
			localStorage.setItem(key, JSON.stringify(newValue));

			return newValue;
		});
	}

	function set(value: T) {
		update(() => value);
	}

	return {
		...store,
		set,
		update
	};
}
