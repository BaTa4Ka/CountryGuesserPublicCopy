<script setup>
  import Navigation from '@/components/Navigation.vue';
</script>

<template>
  <div class="nav">
    <Navigation />
  </div>
  <div class="content">
    <RouterView />
  </div>
</template>

<style scoped>
.nav{
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10; /* Ensures the navigation is on top */
}

.content{
  margin-top: 50px;
}
</style>
