<template>
    <div ref="mapContainer" class="country-map"></div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { Loader } from '@googlemaps/js-api-loader';
  
  const mapContainer = ref(null);
  
  onMounted(async () => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      language: "en"
    });
  
    try {
      await loader.load();
      const map = new google.maps.Map(mapContainer.value, {
        center: { lat: 20, lng: 0 },
        zoom: 3,
        streetViewControl: false, // Remove street view button
        minZoom: 3, // Prevent zooming out too far
        restriction: { // Prevent scrolling to empty areas
          latLngBounds: { north: 85, south: -85, east: 180, west: -180 },
          strictBounds: true
        }
      });
    } catch (error) {
      console.error("Map error:", error);
    }
  });
  </script>
  
  <style scoped>
  .country-map {
    height: calc(100vh - 300px); /* This will make it stretch to bottom of screen */
    min-height: 300px; /* Minimum height */
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  </style>