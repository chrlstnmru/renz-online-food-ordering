<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import getCroppedImg from '$lib/utils/canvas';
	import { createEventDispatcher } from 'svelte';
	import Cropper from 'svelte-easy-crop';
	import type { CropArea, DispatchEvents, Point } from 'svelte-easy-crop/types';

	const dispatch = createEventDispatcher();

	export let origin: Point = { x: 0, y: 0 };
	export let zoom: number = 1;
	export let image: string;
	export let result: { imageBlob: Blob; imageURI: string } | null = null;

	let pixelCrop: CropArea;

	function onCropComplete(event: CustomEvent<DispatchEvents['cropcomplete']>) {
		pixelCrop = event.detail.pixels;
	}

	async function cropImage() {
		result = await getCroppedImg(image, pixelCrop);
		dispatch('crop', { origin, zoom });
	}
</script>

<div class="mt-4 space-y-3">
	<div class="relative aspect-square min-w-[400px] overflow-hidden rounded-md border">
		<Cropper
			image={image}
			aspect={1}
			bind:crop={origin}
			bind:zoom={zoom}
			on:cropcomplete={onCropComplete}
		/>
	</div>
	<div class="grid grid-cols-2 gap-2">
		<Button
			class="justify-center"
			variant="ghost"
			color="neutral"
			on:click={() => dispatch('discard')}
		>
			Discard
		</Button>
		<Button class="justify-center" on:click={cropImage}>Save</Button>
	</div>
</div>
