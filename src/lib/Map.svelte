<script lang="ts">
  import { LeafletMap, TileLayer, Icon, Marker } from 'svelte-leafletjs?client'
  import 'leaflet/dist/leaflet.css'
  import { selectedProperty, displayProperties } from "$lib/../stores";
  import { browser } from "$app/environment"

  const mapOptions = {
    center: [41.083, -74.042],
    zoom: 5
  }
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const tileLayerOptions = {
    minZoom: 0,
    maxZoom: 20,
    maxNativeZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }
  let leafletMap;
</script>


<div style="height: 80vh;" class="w-full">
  {#if browser}
    <LeafletMap bind:this={leafletMap} options={mapOptions}>
      <TileLayer url={tileUrl} options={tileLayerOptions} />
      {#each $displayProperties as property}
        <Marker
          latLng={[property.lat, property.long]}
          events={['click']}
          on:click={() => {
            $selectedProperty = property
          }}
        >
          <Icon />
        </Marker>
      {/each}
    </LeafletMap>
  {/if}
</div>
