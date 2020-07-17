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
      <template>
        <v-dialog v-model="poll_dialog" persistent max-width="600px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="ma-2"
              color="#1f006e"
              dark
              v-bind="attrs"
              v-on="on"
            >
              Create
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">Create a poll</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                  <v-row v-if="error.error == true" class="justify-center" dense>
                    <v-col cols="5">
                      <v-card             
                        color="red"
                        dark
                      >
                        <v-card-title>
                          <span class="headline">Error</span>
                        </v-card-title>
                        <v-card-text>
                          {{ error.msg }}
                        </v-card-text>  
                      </v-card>           
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="question" 
                        label="Question"
                        required
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <v-list v-if="options.length > 0" color="#1f006e">
                    <v-list-item-group>
                      <v-list-item
                        v-for="option in options"
                        :key="options[option.index].index"
                      >
                        <v-list-item-content aria-disabled>
                          <v-list-item-title>{{ option.index + 1 }}. {{ option.text }}</v-list-item-title>
                        </v-list-item-content>

                        <v-btn @click="removeOption(option.index)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>                        
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>

                  <v-row>
                    <v-col cols="12">
                      <v-text-field  
                        label="Enter an option"
                        v-model="option_text"
                        required
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  
                  <div class="text-center">
                    <v-btn class="ma-2" color="primary" @click="addOption()">Add option</v-btn> 
                  </div>

                  <v-row>
                    <v-col cols="12">
                      <v-text-field  
                        label="Set deadline"
                        v-model="date"
                        @focus="date_dialog = true"
                        required
                      >
                      </v-text-field>
                    </v-col>                    
                  </v-row>

                  <v-dialog v-model="date_dialog" persistent max-width="600px">
                      <v-row class="justify-center">
                        <v-date-picker
                          v-model="date"
                          class="mt-2"
                        >
                          <v-spacer></v-spacer>
                          <v-btn color="blue darken-1" text @click="date_dialog = false">Select</v-btn>
                        </v-date-picker>
                      </v-row>
                  </v-dialog>

              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="handleClose()">Close</v-btn>
              <v-btn color="blue darken-1" text @click="handleSave()">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>      
      <v-btn class="ma-2" color="#1f006e" @click="logout()">Log out</v-btn>
    </v-app-bar>  

    <v-divider></v-divider>

    <v-container class="fill-height" fluid>
      <v-row v-if="polls.length === 0" class="justify-center" dense>          
        <v-col cols="4">
          <h1>No polls created. Use create button to get started!</h1>           
        </v-col>
      </v-row>

      <v-row v-if="loader" class="justify-center" dense>
        <v-progress-circular
          :size="70"
          :width="7"
          color="#593780"
          indeterminate
        ></v-progress-circular>     
      </v-row>

      <v-row v-else class="justify-center" dense>
        <v-col v-for="p in polls" cols="4" :key="p.id">
          <v-card
            color="#593780"
            dark
          >
            <v-card-title class="justify-center">
              {{ p.question.length > 40 ? p.question.slice(0, 40) + '...' : p.question }}
            </v-card-title>
            <v-divider></v-divider>
            <v-card-actions class="justify-center">
              <v-btn @click="$router.push({ name: 'view', params : { id : p.id }})" text>View</v-btn>
              <v-btn @click="loadShareLink(p.id)" text>Share</v-btn>
              <v-btn @click="handleDelete(p.id)" text>Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-dialog v-model="share_dialog" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">Share poll link</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="16">
                    <v-text-field  
                      v-text="'http://localhost:8080/cast/'+question_id"
                      aria-selected
                      aria-readonly
                    >                            
                    </v-text-field>
                  </v-col>
                </v-row>                              
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="share_dialog = false">Close</v-btn>
            </v-card-actions>                    
          </v-card>
        </v-dialog>        
      </v-row>

    </v-container>      

    <v-footer
      color="cyan"
      padless
    >
      <v-col
        class="text-center"
        cols="12"
      >
        <strong>vi88i</strong> - {{ new Date().getFullYear() }} 
      </v-col>    
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      delete_icon: 'mdi-delete-circle',
      date: null,
      poll_dialog: false,
      share_dialog: false,
      date_dialog: false,
      question_id: '',
      option_text: '',
      loader: false,
      polls: [],
      options: [],
      question: '',
      error: {
        error: false,
        msg: '',
      },
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
        if (res.auth === false || res.error === true) {
          this.$router.push({ name: 'home' });
        } else {
          this.fetchPolls();
          let cur_date = new Date();
          this.date = `${cur_date.getFullYear()}-${(cur_date.getMonth() + 1 > 9 ? cur_date.getMonth() + 1 : '0' + (cur_date.getMonth() + 1))}-${cur_date.getDate() > 9 ? cur_date.getDate() : '0' + cur_date.getDate()}`;
        }    
      })
      .catch((err) => {
        console.log(err);
      });    
  },
  methods: {
    allowedDates(val) {
      return parseInt(val.split('-')[2], 10) % 2 === 0;
    },
    fetchPolls() {
      fetch('http://localhost:3000/users/listAllPolls', {
        method: 'POST',
        credentials: 'include', // Important: If default value 'same-origin' is used, then cookies are not sent.
        headers: { 
          'Content-type': 'application/json; charset=utf-8',
          'Cache': 'no-cache', 
        },
      })
        .then((res) => res.json())
        .then((res) => {
          this.loader = false;
          this.polls = res.polls;
        })
        .catch((err) => {
          console.log(err);
        });      
    },
    handleDelete(qid) {
      this.loader = true;
      fetch('http://localhost:3000/users/deletePoll', {
        method: 'POST',
        credentials: 'include', // Important: If default value 'same-origin' is used, then cookies are not sent.
        headers: { 
          'Content-type': 'application/json; charset=utf-8',
          'Cache': 'no-cache', 
        },
        body: JSON.stringify({ id: qid })
      })
        .then((res) => res.json())
        .then((res) => {
          this.loader = false;
          if (res.error == false) {
            this.polls = this.polls.filter((elem) => {
              return elem.id !== qid;
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });      
    },
    loadShareLink(qid) {
      this.question_id = qid;
      this.share_dialog = true; 
    },
    handleClose() {
      this.poll_dialog = false;
      this.error = Object.assign({}, { error : false });
      this.question = '';
      this.options = [];
    },
    handleSave() {
      let data = { question: this.question, options: this.options, deadline: this.date };
      if (data.question.length === 0) {
        this.error.error = true;
        this.error.msg = 'Question field is required';
      } else if (data.options.length < 2) {
        this.error.error = true;
        this.error.msg = 'Minimum of two options required';
      } else {
        this.error = Object.assign({}, { error : false });
        fetch('http://localhost:3000/users/submitPoll', {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-type': 'application/json; charset=utf-8',
            'Cache': 'no-cache', 
          },
          body: JSON.stringify(data),
        })
          .then((res) => res.json())
          .then((res) => {
            this.loader = false;
            if (res.auth === false) {
              this.$router.push({ name: 'home' });
            } else if (res.error === false) {
              this.handleClose();
              this.fetchPolls();
            } else if (res.error === true) {
              this.error = Object.assign({}, res); 
            }
          })
          .catch((err) => {
            console.log(err);
          });        
      }    
    },
    addOption() {
      let shouldUpdate = true;
      this.options.forEach((elem) => {
        if (elem.text === this.option_text)
          shouldUpdate = false;
      });
      if (shouldUpdate === true) {
        this.options.push({
          text: this.option_text.trim(),
          index: this.options.length,
        });
      }
      this.option_text = '';
    },
    removeOption(idx) {
      this.options.splice(idx, 1);
      this.options = this.options.map((elem) => {
        elem.index = elem.index > idx ? elem.index - 1 : elem.index;
        return elem;
      });
    },
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