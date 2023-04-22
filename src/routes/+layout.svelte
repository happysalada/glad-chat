<script lang="ts">
  import "../app.postcss";
  import HeartLoader from '$lib/HeartLoader.svelte';
  import Nav from "$lib/Nav.svelte";
  import { onMount } from "svelte";

  let loaded = false;
  onMount(async () => {
    loaded = true;
  });
</script>

{#if !loaded}
  <HeartLoader />
{:else}
  <main class="h-full bg-gray-100">
    <slot />
  </main>
{/if}
