import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Call from '../views/Call.vue';
import SimpleCall from '../views/SimpleCall.vue';
import Conference from '../views/Conference.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/call',
    name: 'Call',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "about" */ `../views/Conference.vue`),
    component: Call,
  },
  {
    path: '/simple-call',
    name: 'SimpleCall',
    component: SimpleCall,
  },
  {
    path: '/conference',
    name: 'Conference',
    component: Conference,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
