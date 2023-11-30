<script lang="ts">
	import Icon from '@iconify/svelte';

	export let label: string;
	export let name: string;
	export let value: number;
	export let checked: boolean = false;
</script>

<label
	class="flex w-full max-w-full select-none justify-center rounded border px-4 py-1.5 sm:justify-center"
>
	<span class="flex items-center gap-1 text-sm">
		<Icon class="text-amber-500 sm:hidden" icon="bi:star-fill" />{label}
	</span>
	<input
		id={value.toString()}
		class="hidden"
		type="radio"
		name={name}
		value={value}
		checked={checked}
	/>
</label>

<style lang="postcss">
	label {
		@apply cursor-pointer hover:border-slate-500 hover:bg-slate-500/5 hover:ring-1 hover:ring-slate-500;
	}
	label:has(input:checked) {
		@apply border-primary-400 bg-primary-500/10 ring-1 ring-primary-400;
	}
</style>
