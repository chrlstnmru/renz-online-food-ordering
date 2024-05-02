import { browser } from '$app/environment';
import persistedStore from '$lib/peristedStore';
import type { Session } from 'lucia';
import { getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';

const BASKET_CTX = 'basketstore';

export type BasketItem = {
	id: string;
	productId: string;
	productName: string;
	variantId: string | null;
	variant: string | null;
	price: number;
	quantity: number;
	imageUrl: string | null;
};

export function createBasket(session: Session | null, initial: BasketItem[] = []) {
	const items = persistedStore<BasketItem[]>('basket', initial);
	const total = writable(0);

	if (browser) items.set(JSON.parse(localStorage.getItem('basket') || '[]'));

	// TODO: Implement server-side basket sync

	items.subscribe(async (items) => {
		total.set(items.reduce((acc, item) => acc + item.price * item.quantity, 0));
	});

	function addItem(item: BasketItem) {
		items.update((items) => {
			const existing = items.findIndex((i) => i.id === item.id);
			if (existing !== -1) {
				items[existing].quantity += item.quantity;
				return items;
			}
			return [...items, item];
		});
	}

	function updateQuantity(id: string, quantity: number) {
		console.log(id, quantity);

		items.update((items) => {
			const existing = items.findIndex((i) => i.id === id);
			if (existing !== -1) {
				items[existing].quantity = quantity;
			}
			return items;
		});
	}

	function removeItem(id: string) {
		items.update((items) => items.filter((item) => item.id !== id));
	}

	function clear() {
		items.set([]);
	}

	return setContext(BASKET_CTX, { items, addItem, removeItem, updateQuantity, clear, total });
}

export function useBasket() {
	const basket = getContext<ReturnType<typeof createBasket>>(BASKET_CTX);
	if (!basket) throw new Error('Basket not initialized.');

	return basket;
}
