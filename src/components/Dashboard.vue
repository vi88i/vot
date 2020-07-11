<template>
  <v-app>
    <v-app-bar
      app
      color="indigo"
      dark
    >
      <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon> -->
      <v-toolbar-title> {{ $route.params.user.split('_').join(' ') }} </v-toolbar-title>
    </v-app-bar>    
  </v-app>
</template>

<script>
export default {
  name: 'Dashboard',
}
</script>