<template>
  <v-app>
  </v-app>
</template>

<script>
export default {
  name: 'PollView',
  data() {
    return {
      loader: false,
      poll: {},
    }
  },
  mounted() {
    this.loader = true;
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
        if (res.auth === false) {
          this.$router.push({ name: 'home' });
        } else {
          this.fetchPoll();
        }    
      })
      .catch((err) => {
        console.log(err);
      });    
  },
  methods: {
    fetchPoll() {
      fetch('http://localhost:3000/users/viewPoll', {
        method: 'POST',
        credentials: 'include', // Important: If default value 'same-origin' is used, then cookies are not sent.
        headers: { 
          'Content-type': 'application/json; charset=utf-8',
          'Cache': 'no-cache', 
        },
        body: JSON.stringify({ id: this.$route.params.id })
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          this.loader = false;
          this.poll = Object.assign({}, res.poll);
        })
        .catch((err) => {
          console.log(err);
        });      
    },    
  },
}
</script>