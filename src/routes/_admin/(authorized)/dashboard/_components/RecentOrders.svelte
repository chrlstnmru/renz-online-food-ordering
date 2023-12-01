<script context="module" lang="ts">
	export type RecentOrdersData = {
		id: string;
		refno: string;
		recipient: string;
		status: 'delivered' | 'waiting' | 'preparing' | 'delivering' | 'cancelled' | 'rejected';
		createdAt: Date;
	};
</script>

<script lang="ts">
	import Icon from '@iconify/svelte';

	import moment from 'moment';
	export let data: RecentOrdersData[];

	moment.updateLocale('en', {
		relativeTime: {
			past: '%s',
			s: 'just now',
			ss: '%d seconds ago',
			m: '1 minute ago',
			mm: '%d minutes ago',
			h: '1 hour ago',
			hh: '%d hours ago',
			d: '1 day ago',
			dd: '%d days ago',
			w: '1 week ago',
			ww: '%d weeks ago',
			M: '1 month ago',
			MM: '%d months ago',
			y: '1 year ago',
			yy: '%d years ago'
		}
	});

	function live(node: HTMLElement, date: Date) {
		node.textContent = moment(date).fromNow();
		setInterval(() => {
			node.textContent = moment(date).fromNow();
		}, 1000 * 60);
	}
</script>

<section class="flex flex-1 flex-col">
	<h3 class="text-xl text-secondary-500">Recent Orders</h3>
	<div class="card custom-scrollbar mt-2 flex-1 overflow-y-auto">
		<table class="w-full" class:h-full={data.length === 0}>
			<thead class="bg-white text-left">
				<th>Order #</th>
				<th>Reference #</th>
				<th>Recipient</th>
				<th class="w-max text-center">Date Ordered</th>
				<th class="w-max text-center">Status</th>
			</thead>
			<tbody>
				{#each data as order (order.id)}
					<tr>
						<td>
							<a class="group underline" href="/_admin/orders?search={order.id}">
								{order.id}
								<Icon
									class="invisible inline text-base text-neutral-400 group-hover:visible group-hover:text-primary-500"
									icon="entypo:link"
								/>
							</a>
						</td>
						<td>{order.refno}</td>
						<td class="max-w-[40ch] truncate">{order.recipient}</td>
						<td class="text-center" use:live={order.createdAt}></td>
						<td class="text-center">
							<span data-status={order.status}>{order.status}</span>
						</td>
					</tr>
				{:else}
					<tr class="h-full text-secondary-300 text-4xl">
						<td colspan="5" class="text-center">No Data</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style lang="postcss">
	th {
		@apply px-2 py-1;
	}
	td {
		@apply px-2 py-2.5;
	}
</style>
