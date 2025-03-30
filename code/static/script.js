import Home from "./components/Home.js";
import unauthorized_page from "./components/unauthorized_page.js";
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
import user_scores from "./components/user_scores.js";
import u_summary from "./components/u_summary.js";
import a_summary from "./components/a_summary_page.js";
import a_student_detail_page from "./components/a_student_detail_page.js";
import a_user_page from "./components/a_user_page.js";
import u_transactions from "./components/u_transactions.js";
import a_transaction from "./components/a_transaction.js";

const routes = [
  { path: "/", component: Home },
  { path: "/unauthorized", component: unauthorized_page},
  { path: "/login", component: login },
  { path: "/register", component: register },
  { path: "/dashboard", component: Dashboard },
  { path: "/a_dashboard", component: a_dashboard },
  {
    path: "/admin/subject",
    name: "ChaptersPage",
    component: ChaptersPage,
  },
  {
    path: "/user/subject",
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
  { path: "/user_score", component: user_scores },
  { path: "/u_summary", component: u_summary },
  { path: "/a_summary", component: a_summary },
  { path: "/user_detail", component: a_user_page },
  {
    path: "/admin/user-detail",
    component: a_student_detail_page,
    props: true,
  },
  { path: "/user_transactions", component: u_transactions },
  { path: "/admin/transactions", component: a_transaction },
];

const router = new VueRouter({
  routes,
});

const app = new Vue({
  el: "#app",
  router,
  template: `<router-view></router-view>`, // Only router-view here
});

