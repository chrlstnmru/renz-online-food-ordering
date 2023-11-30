<script context="module" lang="ts">
	import { tv } from 'tailwind-variants';

	const inputVariants = tv({
		base: 'w-full disabled:bg-neutral-50 rounded-md border border-slate-500 focus-visible:border-slate-500 focus-visible:ring-slate-600',
		variants: {
			error: {
				true: 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-600'
			}
		}
	});

	export type InputVariants = typeof inputVariants;
</script>

<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	type $$Props = SvelteHTMLElements['input'] & {
		label?: string;
		type?: 'text' | 'password' | 'email' | 'number';
		error?: string;
		hideError?: boolean;
		value?: string | number | null;
	};

	export let label: string = '';
	export let type: 'text' | 'password' | 'email' | 'number' = 'text';
	export let error: string | undefined = undefined;
	export let hideError: boolean = false;
	export let value: string | number | null = '';

	$: ({ class: className, ...rest } = $$restProps);
</script>

<div>
	<label class="grid">
		<span>{label}</span>
		{#if type === 'text'}
			<input
				class={inputVariants({ ...$$restProps, error: !!error })}
				type="text"
				bind:value={value}
				{...rest}
			/>
		{:else if type === 'password'}
			<input
				class={inputVariants({ ...$$restProps, error: !!error })}
				type="password"
				bind:value={value}
				{...rest}
			/>
		{:else if type === 'email'}
			<input
				class={inputVariants({ ...$$restProps, error: !!error })}
				type="email"
				bind:value={value}
				{...rest}
			/>
		{:else if type === 'number'}
			<input
				class={inputVariants({ ...$$restProps, error: !!error })}
				type="number"
				bind:value={value}
				{...rest}
			/>
		{/if}
	</label>
	{#if !hideError}
		<p class="error-field">{error ?? ''}</p>
	{/if}
</div>

<style lang="postcss">
	label:has(input:required) span::after {
		content: '*';
		color: red;
		margin-left: 0.25rem;
	}
</style>
