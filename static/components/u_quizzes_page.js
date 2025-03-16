import u_navbar from "./u_navbar.js";

export default {
  template: `
      <div class="container mt-4">
        <u_navbar></u_navbar>
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card shadow">
              <div class="card-body">
                <h2 class="card-title text-center mb-4">Quiz for {{ chapterName }}</h2>
                <div v-if="quizzes.length > 0">
                  <ul class="list-group">
                    <li v-for="quiz in quizzes" :key="quiz.id" class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ quiz.name }}</strong>
                        <br>
                        <small>Start date: {{ quiz.start_date }} </small>
                        <br>
                        <small>End date: {{ quiz.end_date }} </small>
                        <br>
                        <small>Duration: {{ quiz.time_duration }} min</small>
                        <br>
                        <small>Single Attempt: {{ quiz.single_attempt }} </small>
                        <br>
                        <small>Type: {{ quiz.type_of_quiz }}</small>
                        <br>
                        <small>Price: Rs. {{ quiz.price }}</small>
                      </div>
                      <div>
                        <button class="btn btn-sm btn-outline-info me-2" @click="viewQuestions(quiz.id)">Attempt</button>
                      </div>
                    </li>
                  </ul>
                </div>
                <div v-else>
                  <p class="text-muted">No quizzes available.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  components: {
    u_navbar,
  },
  data() {
    return {
      chapterId: null,
      chapterName: "",
      quizzes: [],
    };
  },

  mounted() {
    this.chapterId = this.$route.query.chapter_id;
    this.chapterName = this.$route.query.chapter_name;

    if (!this.chapterId) {
      console.error("❌ No chapter_id found in route.");
      return;
    }
    this.fetchQuizzes();
  },

  methods: {
    async fetchQuizzes() {
      if (!this.chapterId) {
        console.error("❌ No chapter_id found in route.");
        return;
      }
      fetch(`/api/chapter/${this.chapterId}/quizzes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.quizzes = data;
        })
        .catch((error) => console.error("❌ Error fetching quizzes:", error));
    },

    viewQuestions(quizId) {
      this.$router.push({
        path: "/quiz",
        query: { quiz_id: quizId },
      });
    },
  },
};
