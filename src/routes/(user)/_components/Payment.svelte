<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';

	export let value: string = '';
	export let error: string = '';
</script>

<div class="grid grid-cols-2 gap-x-3 space-y-4 sm:grid-cols-1">
	<div class="aspect-square w-full overflow-hidden rounded-md bg-slate-500">
		<img src="/images/qr.jpg" alt="qr" />
	</div>
	<div class="grid place-items-center gap-8">
		<div class="w-full">
			<p class="grid grid-cols-[13ch_auto]" data-gcash-name>Judge Brent Balingit</p>
			<p class="grid grid-cols-[13ch_auto]" data-gcash-no>0921 475 6575</p>
		</div>
		<div class="w-full">
			<Input
				label="Enter reference number:"
				name="refno"
				autocomplete="off"
				bind:value={value}
				error={error}
				required
			/>
		</div>
	</div>
</div>

<style lang="postcss">
	[data-gcash-name]::before {
		content: 'GCash Name: ';
		@apply font-medium;
	}
	[data-gcash-no]::before {
		content: 'GCash Number: ';
		@apply font-medium;
	}
</style>
