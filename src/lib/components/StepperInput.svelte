<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './ui/Button.svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { tv, type VariantProps } from 'tailwind-variants';
	import Icon from '@iconify/svelte';

	const stepperVariants = tv({
		base: 'remove-arrow w-full h-full flex-1 px-2 py-1 text-center'
	});

	type StepperComponent = SvelteHTMLElements['input'] & VariantProps<typeof stepperVariants>;
	interface $$Props extends StepperComponent {
		class?: string;
		value?: number;
		step?: number;
		min?: number;
		max?: number;
		clamp?: boolean;
	}

	let className = '';
	export { className as class };

	let prevValue = 0;
	export let value = 0;
	export let step = 1;
	export let min = 0;
	export let max = 99;
	export let clamp = false;
	let input: HTMLInputElement;

	const dispatch = createEventDispatcher();

	function increase() {
		prevValue = value;
		value += step;
		change();
		dispatch('increase');
	}

	function decrease() {
		prevValue = value;
		value -= step;
		change();
		dispatch('decrease');
	}

	function change(e?: Event) {
		if (clamp) {
			value = Math.min(Math.max(value, min), max);
		}
		dispatch('change', { elem: input, prev: prevValue, value });
	}
</script>

<div class="grid w-full grid-cols-[auto_1fr_auto] items-center gap-0.5">
	<Button
		class="border-primary grid h-full w-11 place-items-center rounded-r-none border text-lg"
		on:click={decrease}
		disabled={value === min}
	>
		<Icon icon="ic:twotone-minus" />
	</Button>
	<input
		class={stepperVariants({ class: className })}
		type="number"
		min="0"
		max="99"
		step={step}
		bind:this={input}
		bind:value={value}
		on:change={change}
		{...$$restProps}
	/>
	<Button
		class="border-primary grid h-full w-11 place-items-center rounded-l-none border text-lg"
		on:click={increase}
		disabled={value === max}
		size="sm"
	>
		<Icon icon="ph:plus-bold" />
	</Button>
</div>
