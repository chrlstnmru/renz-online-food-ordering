<script lang="ts" context="module">
	export type ToastData = {
		title: string;
		description: string;
		color?: string;
	};

	const {
		elements,
		helpers,
		states: { toasts },
		actions: { portal }
	} = createToaster<ToastData>();

	export const addToast = (toastData: ToastData, type?: App.Superforms.Message['type']) => {
		let color: string | undefined;
		switch (type) {
			case 'success':
				color = 'bg-green-500';
				break;
			case 'warning':
				color = 'bg-yellow-500';
				break;
			case 'info':
				color = 'bg-blue-500';
				break;
			case 'error':
				color = 'bg-red-500';
				break;
		}

		helpers.addToast({
			data: {
				...toastData,
				color: color ?? toastData.color
			}
		});
	};
</script>

<script lang="ts">
	import { createToaster, melt } from '@melt-ui/svelte';
	import Toast from './Toast.svelte';
</script>

<div
	class="fixed bottom-0 right-0 z-50 m-4 flex flex-col items-end gap-2 md:bottom-auto md:top-20"
	use:portal
>
	{#each $toasts as toast (toast.id)}
		<Toast elements={elements} toast={toast} />
	{/each}
</div>
