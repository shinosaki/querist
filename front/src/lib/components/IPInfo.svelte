<script>
  import { onMount } from 'svelte';
  import { goto } from "$app/navigation";

  export let data;

  let query;

  $: ({
    status,
    message,
    query: request,
    ip,
    latitude,
    longitude,
    iso3166,
    region,
    state,
    city,
    zip,
    isp,
    org,
    asn,
  } = data);

  $: table = [
    { name: 'IP Address', value: ip },
    { name: 'ISP', value: isp },
    { name: 'AS Number', value: asn },
    { name: 'ISO-3166 Code', value: iso3166 },
    { name: 'Region', value: region },
    { name: 'State', value: state },
    { name: 'City', value: city },
    { name: 'Postal Code', value: zip },
    { name: 'Organization', value: org },
  ];

  const Leaflet = async () => {
    const link = `https://www.openstreetmap.org/#map=10/${latitude}/${longitude}`;

    const L = await import('leaflet').then(m => m.default);
    const map = L.map('map').setView([latitude, longitude], 10);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: `&copy; <a href="${link}" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>`
    }).addTo(map);
  }
</script>

<div class="my-10 mx-10 md:mx-20 flex flex-col gap-14">
  <form
    method="POST"
    action="/ip"
    class="flex flex-col md:flex-row gap-2 md:gap-5 md:items-end justify-center">
    <label class="md:w-1/2 flex flex-col gap-0.5">
      <span>IP Address</span>
      <input
        class="rounded-lg border-1 border-gray-300 hover:border-gray-400 focus:border-gray-500 focus:ring-gray-500"
        type="text"
        name="query"
        bind:value={query}
        placeholder={ip}>
    </label>

    <button
      on:click|preventDefault={() => goto(`/ip/${query}`)}
      class="py-3 px-10 rounded-lg text-white bg-gray-900 hover:bg-gray-700">
      <span>Lookup</span>
    </button>
  </form>

  {#if status === false}
    <div class="flex flex-col items-center gap-5">
      <h1 class="text-2xl">Error: {message ?? 'Unknown Error'}</h1>
      <p class="text-lg">Your query: "{request}"</p>
    </div>
  {:else}
    <div class="grid md:grid-cols-2 gap-5">
      <table class="border border-separate rounded-lg">
        {#each table as { name, value } (name)}
          <tr class="grid grid-cols-2 text-left border-b last:border-b-0">
            <th class="mx-4 md:mx-6 my-4 overflow-x-auto whitespace-nowrap">{name}</th>
            <td class="mx-4 md:mx-6 my-4 overflow-x-auto">
              <span class:cursor-pointer={(value?.length)} class:opacity-50={!value} on:click={() => navigator.clipboard.writeText(value ?? '')}>{(value?.length) ? value : 'Unknown'}</span>
            </td>
          </tr>
        {/each}
      </table>

      <div id="map" class="min-h-[theme(space.72)]">
        {#await Leaflet()}
          <p class="p-4">
            JavaScript is required to display the map.
            The map data is provided by <a href="https://www.openstreetmap.org">OpenStreetMap</a> and is rendered using <a href="https://leafletjs.com">Leaflet</a>.
          </p>
        {:then}
        {/await}
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  td {
    scrollbar-width: none;
  }
  td::-webkit-scrollbar {
    display: none
  }
</style>
