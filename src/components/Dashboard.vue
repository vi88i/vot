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
                        v-model="poll.question" 
                        label="Question"
                        required
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <v-list v-if="poll.options.length > 0" color="#1f006e">
                    <v-list-item-group>
                      <v-list-item
                        v-for="option in poll.options"
                        :key="poll.options[option.index].index + save_click"
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
      <v-row v-if="loader" class="justify-center" dense>
        <v-progress-circular
          :size="70"
          :width="7"
          color="#593780"
          indeterminate
        ></v-progress-circular>     
      </v-row>

      <v-row v-else class="justify-center" dense>
        <v-col v-for="p in polls" cols="4" :key="p.question">
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
              <v-btn @click="handleDelete(p.question)" text>Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
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
      poll_dialog: false,
      option_dialog: false,
      option_text: '',
      loader: false,
      polls: [],
      save_click: 0,
      error: {
        error: false,
        msg: '',
      },
      default_poll: {
        question: '',
        options: [],
      },
      poll: {
        question: '',
        options: [],
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
        if (res.auth === false) {
          this.$router.push({ name: 'home' });
        } else {
          this.fetchPolls();
        }    
      })
      .catch((err) => {
        console.log(err);
      });    
  },
  methods: {
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
    handleDelete(q) {
      this.loader = true;
      fetch('http://localhost:3000/users/deletePoll', {
        method: 'POST',
        credentials: 'include', // Important: If default value 'same-origin' is used, then cookies are not sent.
        headers: { 
          'Content-type': 'application/json; charset=utf-8',
          'Cache': 'no-cache', 
        },
        body: JSON.stringify({ question: q })
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
    handleClose() {
      this.poll_dialog = false;
      this.error = Object.assign({}, { error : false });
      this.poll = Object.assign({}, this.default_poll);
    },
    handleSave() {
      let data = { ...this.poll };
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
              this.save_click = this.save_click + 1;
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
      this.poll.options.forEach((elem) => {
        if (elem.text === this.option_text)
          shouldUpdate = false;
      });
      if (shouldUpdate === true) {
        this.poll.options.push({
          text: this.option_text.trim(),
          index: this.poll.options.length,
        });
      }
      this.option_text = '';
    },
    removeOption(idx) {
      this.poll.options.splice(idx, 1);
      this.poll.options = this.poll.options.map((elem) => {
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