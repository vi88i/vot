<template>
  <v-app>
    <v-container class="fill-height" fluid>
      <v-row v-if="loader" class="justify-center" dense>
        <v-progress-circular
          :size="70"
          :width="7"
          color="#593780"
          indeterminate
        ></v-progress-circular>     
      </v-row>
      <v-row v-else class="justify-center" dense>
        <v-col cols="5">
          <v-card
            v-if="showQuestion"       
            dark
          >
            <v-card-title>
              <span class="headline"> {{ poll.question === '' ? "Poll doesn't exists" : poll.question }} </span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="16">
                    <v-radio-group v-model="selected" :mandatory="false">
                      <v-radio v-for="option in poll.options" :label="option.text" :value="option.text" :key="option.text"></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>               
              </v-container>

              <v-divider></v-divider>

              <v-row>
                <v-col cols="16">
                  <v-text-field  
                    label="Enter voter ID: "
                    v-model="voter_id"
                    required
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <small>Pollster: {{ pollster }}</small>

            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="submitVote()">Vote</v-btn>
            </v-card-actions>            
          </v-card>

          <v-card
            v-else       
            dark
          >
            <v-card-title>
              <span class="headline"> {{ poll.question === '' ? "Poll doesn't exists" : poll.question }} </span>
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
  name: 'CastPoll',
  data() {
    return {
      loader: false,
      selected: '',
      pollster: '',
      voter_id: '',
      showQuestion: true,
      result: {},
      poll: {
        pollster: '',
        question: '',
        options: [],
      }
    }
  },
  mounted() {
    this.loader = true;
    fetch('http://localhost:3000/loadPoll', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ id: this.$route.params.id }),
    })
      .then((res) => res.json())
      .then((res) => {
        this.loader = false;
        if (res.error == true) {
          this.$router.push({ name: 'error' });
        } else {
          this.selected = res.poll.options[0].text;
          this.pollster = res.poll.pollster;
          this.poll = Object.assign({}, res.poll);
        }     
      })
      .catch((err) => {
        console.log(err);
      });          
  },
  methods: {
    submitVote() {
    fetch('http://localhost:3000/castPoll', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ id: this.$route.params.id, selected: this.selected, voter_id: this.voter_id }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        this.loader = false;
        if (res.error === true) {
          this.$router.push({ name: 'error' });
        } else {
          this.showQuestion = false;
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