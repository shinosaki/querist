<script>
  import { goto } from "$app/navigation";

  export let data;

  $: ({
    status,
    whois,
  } = data);
</script>

<div class:hidden={!status} class="my-10 mx-10 md:mx-20 flex flex-col gap-5 border border-separate rounded-lg p-4 md:p-8">
  <h2 class="text-2xl">Whois Data</h2>
  <pre class="h-[40rem] p-4 md:p-10 bg-gray-200 overflow-auto">{whois}</pre>
</div>
