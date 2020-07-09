<template>
  <v-app>
    <v-container class="fill-height" fluid>
      <v-row class="justify-center" dense>
        <v-col cols="5">
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
}
</script>