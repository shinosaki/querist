<script>
  import { IPInfo, Whois } from '$lib/components';
  export let data;
</script>

<svelte:head>
  <title>Querist - Lookup Your IP Address Information.</title>
</svelte:head>

<IPInfo data={data.info} />

<Whois data={data.whois} />
