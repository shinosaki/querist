<script>
  import { page } from '$app/stores';
  import { IPInfo, Whois } from '$lib/components';
  export let data;
</script>

<svelte:head>
  <title>{$page.params.query} IP Address Information - Querist</title>
</svelte:head>

<IPInfo data={data.info} />

<Whois data={data.whois} />
