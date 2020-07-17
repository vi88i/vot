<template>
  <v-app>
    <v-container class="fill-height" fluid>
      <v-row class="justify-center" dense>
        <v-col cols="5">
          <v-card       
            dark
          >
            <v-card-title class="justify-center">
              <span class="headline"> {{ result.question }} </span>
            </v-card-title>
            <v-card-subtitle>
              <v-row class="justify-center">
                <strong>{{ time }}</strong>
              </v-row>
            </v-card-subtitle>            
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
import io from 'socket.io-client';

export default {
  name: 'PollView',
  data() {
    return {
      loader: false,
      result: {},
      time: '--:--:--',
      deadline: 0,      
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
          this.startMonitor();
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
            let date = new Date(res.result.deadline);
            this.deadline = date.getTime() - Date.now();            
            this.result = Object.assign({}, res.result);
            this.startTimer();
          }
        })
        .catch((err) => {
          console.log(err);
        });      
    },    
    startMonitor() {
      let me = this;
      let socket = io.connect("http://localhost:5000");
      socket.on(this.$route.params.id, (packet) => {
        let res = JSON.parse(packet);
        me.result = Object.assign({}, res);
      });
    },
    startTimer() {
      let me = this;
      setInterval(() => {
        let d = new Date(me.deadline);
        if (d.getTime() > 0) {
          me.time = `${d.getHours() > 9 ? d.getHours() + ' hours ' : '0' + d.getHours() + ' hours '} - ${d.getMinutes() > 9 ? d.getMinutes() + ' minutes ' : '0' + d.getMinutes() + ' minutes '} - ${d.getSeconds() > 9 ? d.getSeconds() + ' seconds ': '0' + d.getSeconds() + ' seconds '}`;
          me.deadline = me.deadline - 1000;
        } else {
          me.time = "This poll is closed, your answer won't be considered!";
        }
      }, 1000);
    },    
  },
}
</script>