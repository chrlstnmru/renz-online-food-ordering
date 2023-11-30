<script lang="ts">
	import UserProfile from '$lib/components/UserProfile.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>My Profile</title>
</svelte:head>

<div class="mt-4 grid place-items-center">
	<UserProfile
		onboardingForm={data.onboardingForm}
		session={data.session}
		profile={data.profile}
		showSignOut={false}
	/>
</div>
