<template>
  <v-app>
    <v-container class="fill-height" fluid>
      <v-row class="justify-center" dense>
        <v-col cols="5">
          <v-card       
            dark
          >
            <v-card-title>
              <span class="headline"> {{ result.question }} </span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row v-for="(data, option) in result.data" :key="option">
                  <v-col cols="16">
                    <v-progress-linear
                      v-model="data.vote_percent"
                      color="cyan"
                      height="25"
                    >
                      <template v-slot="{ value }">
                        <strong>{{ option + ' : ' + value + '% (' + data.votes + ' votes)' }}</strong>
                      </template>                    
                    </v-progress-linear>
                  </v-col>
                </v-row>
                <div class="text-center">
                  <v-chip
                    class="ma-2"
                    color="#1f006e"
                    text-color="white"
                  >
                    <v-avatar
                      left
                      class="purple darken-4"
                    >
                      {{ result.t }}
                    </v-avatar>
                    Votes
                  </v-chip>
                </div>
              </v-container>
            </v-card-text>
          </v-card>          
        </v-col>
      </v-row>     
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'PollView',
  data() {
    return {
      loader: false,
      result: {},
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
          this.loader = false;
          if (res.error == true) {
            this.$router.push({ name: 'error' });
          } else {
            this.result = Object.assign({}, res.result);
          }
        })
        .catch((err) => {
          console.log(err);
        });      
    },    
  },
}
</script>