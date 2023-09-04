<script>
	import 'leaflet/dist/leaflet.css';
	import '../app.postcss';
</script>

<div class="flex flex-col min-h-screen overflow-hidden">
	<header class="sticky z-50 w-full p-6 px-10 flex items-center justify-between text-lg shadow">
		<a href="/" class="contents">
			<span class="font-semibold text-xl">Querist</span>
		</a>

		<ul class="flex gap-5 items-center text-gray-700/80">
			<li><a href="/ip">IP Info</a></li>
			<!-- <li><a href="/dns">DNS</a></li> -->
			<li><a href="https://github.com/shinosaki/querist" target="_blank" rel="noopener noreferrer">About</a></li>
		</ul>
	</header>

	<slot />

	<footer class="mt-auto w-full p-10 px-10 flex items-center justify-between text-gray-700/80 border-t">
		<p>
			IP geolocation data is provided by <a href="https://ip-api.com">ip-api</a>.
			<!-- IP geolocation data is provided by <a href="https://www.maxmind.com">MaxMind</a>’s <a href="https://dev.maxmind.com/geoip/geolite2-free-geolocation-data">GeoLite2</a>. -->
		</p>
		<p>
			Made by <a href="https://shinosaki.com">@shinosaki</a>
		</p>
	</footer>
</div>
