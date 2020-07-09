<template>
  <v-app>
    <v-container class="fill-height" fluid>
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
                    <v-col cols="12" sm="6" md="12">
                      <v-text-field 
                        v-model="user.name" 
                        label="Name"
                        single-line="true"
                        color="white"
                        required
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>  
                  <v-row>
                    <v-col cols="12" sm="6" md="12">
                      <v-text-field 
                        v-model="user.password" 
                        :type="'password'" 
                        label="Password" 
                        single-line="true"
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
    }
  },
  methods: {
    handleSubmit() {
      //
    }
  }
}
</script>