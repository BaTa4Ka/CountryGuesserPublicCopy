import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../api/firebase"; 

const isAuth = (to, from, next) => {
  const auth = getAuth(app);
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe(); 
    if (user) {
      next(); 
    } else {
      next('/login'); 
    }
  });
};

function loadPage (component) {
    return () => import(`@/pages/${component}.vue`)}
    export default [
    { path: '/', component: loadPage('Home') },
    { path: '/about', component: loadPage('About') },
    { path: '/profile/:uid', component: loadPage('Profile'), props: true },
    { path: '/profile', component: loadPage('Profile')},
    { path: '/wlike', component: loadPage('WLike') },
    { path: '/flagguesser', component: loadPage('FlagGuesser') },
    { path: '/coordinatesguesser', component: loadPage('CoordinatesGuesserGame') },
    { path: '/signup', component: loadPage('Signup') },
    { path: '/login', component: loadPage('Login') },
    { path: '/mp', component: loadPage('Multiplayer')},
    { path: '/room/:rid', component: loadPage('Room'), props: true },
    { path: '/createroom', component: loadPage('CreateRoom')},
    { path: '/upload', component: loadPage('Upload'), beforeEnter: isAuth }
    ];