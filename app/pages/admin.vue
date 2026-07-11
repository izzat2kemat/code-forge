<script setup>
// Parent wrapper for all admin-related routes
</script>

<template>
  <div class="admin-layout">
    <NuxtPage />
  </div>
</template>

<style>
/* Shared layouts and global resets for admin pages */
.admin-layout {
  min-height: 100vh;
  background-color: #030712;
  color: #f3f4f6;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow-x: hidden;
}
</style>
