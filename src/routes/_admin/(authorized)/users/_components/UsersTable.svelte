<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import type { Paginated } from '$lib/server/types';
	import type { DialogStates } from '@melt-ui/svelte';
	import type { UserData } from './types';
	import Dialog from '$lib/components/Dialog.svelte';

	export let data: Paginated<UserData>;

	let selectedUser: UserData;
	let userInfoDialog: DialogStates;
	function openUserInfoDialog(i: number) {
		selectedUser = data.items[i];
		userInfoDialog.open.set(true);
	}
</script>

<Dialog bind:states={userInfoDialog}>
	<svelte:fragment slot="title">User Info</svelte:fragment>
	<div id="user-info" class="max-w-[340px]">
		<span data-label="Id" class="wrap">{selectedUser.id}</span>
		<span data-label="Name" class="wrap">
			{[selectedUser.firstName, selectedUser.middleName, selectedUser.lastName].join(' ')}
		</span>
		<span data-label="Email" class="break-words">{selectedUser.email}</span>
		<span data-label="Phone" class="wrap">{selectedUser.phone}</span>
		<span data-label="Address" class="wrap">{selectedUser.address}</span>
		<span data-label="Date joined" class="wrap">
			{new Date(selectedUser.createdAt).toLocaleDateString()}
		</span>
	</div>
</Dialog>

<div class="custom-scrollbar mt-4 flex-1 overflow-y-auto rounded-md border">
	<table class="relative w-full" class:h-full={!data.items.length}>
		<thead class="sticky top-0 border-b text-left">
			<th class="w-0"></th>
			<th>First name</th>
			<th>Middle name</th>
			<th>Last name</th>
			<th>Email</th>
			<th>Phone</th>
			<th>Adress</th>
			<th class="w-auto px-2">Actions</th>
		</thead>
		<tbody class="text-center">
			{#each data.items as user, i (user.id)}
				<tr class="text-left odd:bg-black/[0.025]">
					<td class="w-0">{i + 1}</td>
					<td class="max-w-[28ch] truncate">{user.firstName}</td>
					<td class="max-w-[28ch] truncate">{user.middleName ?? ''}</td>
					<td class="max-w-[28ch] truncate">{user.lastName}</td>
					<td class="max-w-[32ch] truncate">{user.email}</td>
					<td class="max-w-[20ch] truncate">{user.phone}</td>
					<td class="max-w-[36ch] truncate">
						{user.address}
					</td>
					<td class="w-0">
						<div class="mx-auto w-max">
							<Button
								title="View user"
								class="text-xs uppercase"
								variant="solid"
								color="neutral"
								on:click={() => openUserInfoDialog(i)}
							>
								view
							</Button>
						</div>
					</td>
				</tr>
			{:else}
				<tr class="h-full text-secondary-300 text-3xl">
					<td colspan="7" class="py-4">No user found.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="postcss">
	th {
		@apply bg-white px-5 py-3;
	}
	td {
		@apply px-5 py-2.5;
	}
	[data-label] {
		@apply grid grid-cols-[12ch,auto] break-all px-4 py-2;
	}
	[data-label]::before {
		content: attr(data-label) ': ';
	}
	#user-info > :nth-child(odd) {
		@apply bg-black/[0.025];
	}
</style>
