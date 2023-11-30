import { writable, type Updater } from 'svelte/store';
import type { BasketEntry, BasketSummary } from '../server/types';

export const basketSummaryStore = writable<BasketSummary>({ entries: [], total: 0 });
export function appendEntry(value: BasketEntry) {
	basketSummaryStore.update((current) => {
		console.log('current', current, 'value', value);

		// Merge entries with same id
		const existing = current.entries.findIndex((item) => item.id === value.id);
		if (existing !== -1) {
			current.entries[existing].quantity = value.quantity;
			return current;
		} else {
			console.log('pushing', value);
			current.entries.push(value);
		}

		// Recalculate total
		current.entries
			.map((item) => {
				if (item.variant) {
					return item.variant.price * item.quantity;
				}
				return item.product.price * item.quantity;
			})
			.reduce((a, b) => a + b, 0);
		return current;
	});
}
