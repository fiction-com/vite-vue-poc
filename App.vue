<template>
  <div class="nav">
    <router-link to="/">Home</router-link>
    <router-link to="/a">Page</router-link>
  </div>
  <div class="test"><router-view></router-view></div>
</template>

<script lang="ts">
export default {
  name: "App",
  components: {},
};
</script>

<style>
.nav a {
  margin: 1rem;
}
</style>