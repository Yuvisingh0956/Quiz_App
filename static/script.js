import Home from "./components/Home.js";
import login from "./components/login.js";
import register from "./components/register.js";
import NavBar from "./components/navbar.js";
import Footer from "./components/footer.js";
import Dashboard from "./components/dashboard.js";
import a_dashboard from "./components/a_dashboard.js";
import logout from "./components/logout.js";
import ChaptersPage from "./components/chapters_page.js";
import quizzes_page from "./components/quizzes_page.js";
import questions_page from "./components/questions_page.js";
import UserChaptersPage from "./components/u_chapters_page.js";
import UserQuizzesPage from "./components/u_quizzes_page.js";
import QuizAttempt from "./components/u_quiz_attempt.js";
import results_page from "./components/results_page.js";
// import axios from "../node_modules/axios";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: login },
  { path: "/register", component: register },
  { path: "/dashboard", component: Dashboard },
  { path: "/a_dashboard", component: a_dashboard },
  {
    path: "/admin/subject/:subject_id",
    name: "ChaptersPage",
    component: ChaptersPage,
  },
  {
    path: "/user/subject/:subject_id",
    name: "UserChaptersPage",
    component: UserChaptersPage,
  },
  { path: "/quizzes", component: quizzes_page },
  { path: "/u_quizzes", component: UserQuizzesPage },
  { path: "/questions", component: questions_page },
  { path: "/logout", component: logout },
  { path: "/admin/subject/:id", component: ChaptersPage, props: true },
  { path: "/quiz", component: QuizAttempt, props: true },
  { path: "/results", component: results_page },
];

const router = new VueRouter({
  routes,
});

const app = new Vue({
  el: "#app",
  router,
  template: `<router-view></router-view>`, // Only router-view here
});
