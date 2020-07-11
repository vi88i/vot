<template>
  <v-app>
    <v-container class="fill-height" fluid>
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
        <v-row class="justify-center" dense>
          <v-col cols="5">
            <v-card             
              color="cyan"
              dark
            >
              <v-card-title>
                <span class="headline">Sign in</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="user.name" 
                        label="Name"
                        color="white"
                        required
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>  
                  <v-row>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="user.password" 
                        :type="'password'" 
                        label="Password" 
                        color="white"
                        required
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>                                                                  
                </v-container>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn @click="handleSubmit()" text>Sign in</v-btn>
              </v-card-actions>
            </v-card>           
          </v-col>
        </v-row>   
    </v-container>    
  </v-app>    
</template>

<script>
export default {
  name: 'SignIn',
  data() {
    return {
      user: {
        name: null,
        password: null,
      },
      error: {
        error : false,
        msg: null,
      }
    }
  },
  methods: {
    handleSubmit() {
      fetch('http://localhost:3000/users/sign-in', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify(this.user),
      })
        .then((res) => res.json())
        .then((res) => {
          this.error = Object.assign({}, res);
          if (res.auth === true)
            this.$router.push({ name : 'dashboard' });      
        })
        .catch((err) => {
          console.log(err);
        });      
    }
  }
}
</script>