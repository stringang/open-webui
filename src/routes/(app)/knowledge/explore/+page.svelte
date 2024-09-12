<script>
	import Documents from '$lib/components/knowledge/Documents.svelte';
	import { onMount } from 'svelte';

	const myself = false;

	onMount(async () => {});
</script>

<Documents {myself} />