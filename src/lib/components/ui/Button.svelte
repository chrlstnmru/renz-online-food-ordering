<script context="module" lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';

	export type ButtonVariants = VariantProps<typeof buttonVariants>;
	export const buttonVariants = tv({
		base: 'inline-flex items-center select-none rounded-md border border-transparent font-medium opacity-100 transition-all duration-75 ease-out hover:opacity-80 active:opacity-95 disabled:pointer-events-none disabled:select-none disabled:opacity-75',
		variants: {
			color: {
				primary: 'bg-primary-500 text-primary-500 ',
				secondary: 'bg-secondary-500 hover:bg-secondary-400 active:bg-secondary-600',
				danger: 'bg-red-500 hover:bg-red-400 active:bg-red-600',
				success: 'bg-green-500 hover:bg-green-300 active:bg-green-600',
				warning: 'bg-yellow-500 hover:bg-yellow-300 active:bg-yellow-600',
				info: 'bg-blue-500 hover:bg-blue-300 active:bg-blue-600',
				neutral: 'bg-gray-500 hover:bg-gray-400 active:bg-gray-600'
			},
			variant: {
				solid: 'border-current text-white',
				outline: 'border-current bg-transparent',
				ghost: 'border-transparent bg-transparent'
			},
			size: {
				xs: 'px-2 py-0.5 rounded text-sm',
				sm: 'px-2.5 py-1 rounded text-sm',
				md: 'px-3.5 py-2',
				lg: 'rounded-lg px-6 py-2.5',
				xl: 'rounded-lg px-7 py-3 text-lg'
			},
			rounded: {
				true: 'rounded-full'
			},
			square: {
				true: 'aspect-square'
			},
			hidden: {
				true: 'hidden'
			}
		},
		compoundVariants: [
			{
				color: 'primary',
				variant: 'ghost',
				class: 'hover:bg-primary-500/20'
			},
			{
				color: 'primary',
				variant: 'solid',
				class: 'border-transparent'
			},
			{
				color: 'neutral',
				variant: 'ghost',
				class: 'hover:bg-gray-500/20 active:bg-gray-500/40'
			},
			{
				color: 'secondary',
				variant: 'outline',
				class: 'hover:bg-secondary-500/20 active:bg-secondary-500/40'
			},
			{
				color: 'danger',
				variant: 'ghost',
				class: 'hover:bg-red-500/20 active:bg-red-500/40 hover:text-red-500'
			},
			{
				square: true,
				size: 'xs',
				class: 'px-2 py-2'
			},
			{
				square: true,
				size: 'sm',
				class: 'px-4 py-4'
			}
		],
		defaultVariants: {
			color: 'primary',
			variant: 'solid',
			size: 'md'
		}
	});
</script>

<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	type $$Props = SvelteHTMLElements['button'] &
		ButtonVariants & {
			loading?: boolean;
			action?: (elem: HTMLButtonElement) => void;
		};

	export let action: (elem: HTMLButtonElement) => void = function () {};
	export let loading = false;

	$: ({ class: className, ...rest } = $$restProps);
</script>

<button
	class={buttonVariants({ ...$$restProps })}
	type="button"
	disabled={loading}
	{...rest}
	on:click
	use:action
>
	{#if loading}
		<div
			class="mr-2 inline-block aspect-square w-5 animate-spin rounded-full border-4 border-white border-b-white/30"
		/>
	{/if}
	<slot />
</button>
