<template>
  <v-app>
    <v-container class="fill-height" fluid>   
      <v-row class="justify-center" dense>
        <v-progress-circular
          v-if="loader"
          :size="70"
          :width="7"
          color="#593780"
          indeterminate
        ></v-progress-circular>        
        <v-col v-if="!loader" cols="5">
          <v-card
            color="cyan"
            dark
          >
            <v-card-title class="headline">vot</v-card-title>

            <v-card-subtitle>Quickly and easily conduct opinion poll.</v-card-subtitle>
            <v-card-actions         
              class="justify-center"
            >
              <v-btn @click="$router.push({ name : 'sign-in' })" text>Sign in</v-btn>
              <v-btn @click="$router.push({ name : 'sign-up' })" text>Sign up</v-btn>
            </v-card-actions>
          </v-card>      
        </v-col>
      </v-row>      
    </v-container>    
  </v-app>  
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      loader: false,
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
        this.loader = false;
        if (res.auth === true)
          this.$router.push({ name: 'dashboard', params: { user: res.name.split(' ').join('_') } });    
      })
      .catch((err) => {
        console.log(err);
      });    
  },
}
</script>