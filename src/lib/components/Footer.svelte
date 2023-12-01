<script lang="ts">
	import type { NavLink } from './types';
	import Icon from '@iconify/svelte';

	export let navlinks: NavLink[] = [];
</script>

<footer class="mt-auto bg-secondary-950 py-10">
	<div class="container grid grid-cols-4 gap-4 text-white sm:flex sm:flex-col">
		<section>
			<h2 class="select-none text-3xl font-black">
				RENZ
				<div class="text-base font-normal leading-3">Online Food Ordering</div>
			</h2>
			<p class="mt-3 text-sm font-light tracking-wider">
				&copy; {new Date(Date.now()).getFullYear()}. All rights reserved.
			</p>
		</section>
		<section>
			{#if navlinks.length !== 0}
				<h2 class="font-bold tracking-wider">Navigation</h2>
				<nav class="mt-3" aria-label="footer navigation">
					<ul class="space-y-2 text-sm font-light capitalize tracking-wider">
						{#each navlinks as { name, href }}
							{#if name.toLowerCase() !== 'logout'}
								<li>
									<a href={href}>{name}</a>
								</li>
							{/if}
						{/each}
					</ul>
				</nav>
			{/if}
		</section>
		<div id="contact-us" class="space-y-4 tracking-wider sm:col-span-1">
			<section>
				<h2 class="font-bold">Contact</h2>
				<div class="mt-3 space-y-2 text-sm font-light">
					<p>
						Email:
						<a class="break-words underline" href="mailto:examplemail2000@gmail.com">
							renzpancitmalabon@gmail.com
						</a>
					</p>
					<p>
						Phone:
						<a href="tel:+639555027941">+63 955 502 7941</a>
					</p>
				</div>
			</section>
			<section class="tracking-wider">
				<h2 class="font-bold">Socials</h2>
				<div class="mt-3">
					<p class="max-w-max">
						<a href="https://facebook.com/renzpancitmalabon" target="_blank">
							<Icon icon="ant-design:facebook-filled" class="h-8 w-8" />
						</a>
					</p>
				</div>
			</section>
		</div>
		<section class="tracking-wider sm:col-span-4">
			<h2 class="font-bold tracking-wider">Location</h2>
			<p class="mt-3 text-sm font-light">
				#1 Ecija Dela Costa Ave, Novaliches, Quezon City, Metro Manila 1425 Caloocan, Philippines
			</p>
		</section>
	</div>
</footer>
