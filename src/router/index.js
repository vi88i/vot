import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/components/Home.vue'
import SignIn from '@/components/SignIn.vue'
import SignUp from '@/components/SignUp.vue'
import Dashboard from '@/components/Dashboard.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: SignIn
  },  
  {
    path: '/sign-up',
    name: 'sign-up',
    component: SignUp
  },
  {
    path: '/dashboard/:user',
    name: 'dashboard',
    component: Dashboard,
  }    
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
