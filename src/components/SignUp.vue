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
        <v-row  v-else-if="error.error == false" class="justify-center" dense>
          <v-col cols="5">
            <v-card             
              color="green"
              dark
            >
              <v-card-title>
                <span class="headline">Success</span>
              </v-card-title>
              <v-card-actions class="justify-center">
                <v-btn @click="$router.push({ name : 'sign-in' })" text>Sign in</v-btn>
              </v-card-actions>
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
                <span class="headline">Sign up</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="user.name" 
                        label="Name"
                        color="white"
                        hint="only 2-20 alphanumeric characters allowed" 
                        required
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>  
                  <v-row>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="user.email" 
                        label="E-mail"
                        color="white"
                        hint="only .com and .net domains allowed" 
                        required
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="user.password" 
                        label="Password"
                        color="white"
                        hint="only 8-20 alphanumeric characters allowed"
                        :type="'password'"
                        required
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="user.re_password" 
                        label="Re-enter password"
                        color="white"
                        hint="should match the password"
                        :type="'password'" 
                        required
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>                                                                        
                </v-container>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn @click="handleSubmit()" text>Sign up</v-btn>
              </v-card-actions>
            </v-card>           
          </v-col>
        </v-row>   
    </v-container>    
  </v-app>    
</template>

<script>
export default {
  name: 'SignUp',
  data() {
    return {
      user: {
        name: null,
        email: null,
        password: null,
        re_password: null,
      },
      error: {
        msg: null,
        error: null,
      },
    }
  },
  methods: {
    handleSubmit() {
      fetch('http://localhost:3000/users/sign-up', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify(this.user),
      })
        .then((res) => res.json())
        .then((res) => {
          this.error = Object.assign({}, res);      
        })
        .catch((err) => {
          console.log(err);
        });      
    }
  },
}
</script>