<template>
  <v-app>
    <v-app-bar
      app
      color="cyan"
      dark
    >
      <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon> -->
      <v-toolbar-title> {{ $route.params.user.split('_').join(' ') }} </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="cyan" @click="logout()">Log out</v-btn>
    </v-app-bar>    
  </v-app>
</template>

<script>
export default {
  name: 'Dashboard',
  mounted() {
    fetch('http://localhost:3000/users/isLoggedIn', {
      method: 'POST',
      credentials: 'include', // Important: If default value 'same-origin' is used, then cookies are not sent.
      headers: { 
        'Content-type': 'application/json; charset=utf-8',
        'Cache': 'no-cache', 
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.auth === false)
          this.$router.push({ name: 'home' });    
      })
      .catch((err) => {
        console.log(err);
      });    
  },
  methods: {
    logout() {
      fetch('http://localhost:3000/users/logout', {
        method: 'POST',
        credentials: 'include', // Important: If default value 'same-origin' is used, then cookies are not sent.
        headers: { 
          'Content-type': 'application/json; charset=utf-8',
          'Cache': 'no-cache', 
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.error === false)
            this.$router.push({ name: 'home' });    
        })
        .catch((err) => {
          console.log(err);
        });      
    }
  },
}
</script>