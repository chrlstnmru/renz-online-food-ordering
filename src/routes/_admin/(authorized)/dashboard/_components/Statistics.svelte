<script lang="ts">
	import Icon from '@iconify/svelte';

	export let data: { users: number; products: number; delivered: number; cancelled: number };
</script>

<section class="mt-6">
	<h3 class="text-xl text-secondary-500">Statistics</h3>
	<div class="mt-2 grid grid-cols-4 gap-4">
		<div class="card flex items-center p-8 text-neutral-700">
			<div>
				<p>Products</p>
				<p class="text-5xl font-semibold">{data.products.toLocaleString()}</p>
			</div>
			<Icon class="ml-auto h-max max-w-[60px]" icon="fa6-solid:gift" width="100%" />
		</div>
		<div class="card flex items-center p-8 text-neutral-700">
			<div>
				<p>Delivered</p>
				<p class="text-5xl font-semibold">{data.delivered.toLocaleString()}</p>
			</div>
			<Icon class="ml-auto h-max max-w-[60px]" icon="bxs:truck" width="100%" />
		</div>
		<div class="card flex items-center p-8 text-neutral-700">
			<div>
				<p>Cancelled Orders</p>
				<p class="text-5xl font-semibold">{data.cancelled.toLocaleString()}</p>
			</div>
			<Icon class="ml-auto h-max max-w-[60px]" icon="ep:failed" width="100%" />
		</div>
		<div class="card flex items-center p-8 text-neutral-700">
			<div>
				<p>Users</p>
				<p class="text-5xl font-semibold">{data.users.toLocaleString()}</p>
			</div>
			<Icon class="ml-auto h-max max-w-[60px]" icon="mdi:users-group" width="100%" />
		</div>
	</div>
</section>
