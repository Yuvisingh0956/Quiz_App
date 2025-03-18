import u_navbar from "./u_navbar.js";
import a_navbar from "./a_navbar.js";

export default {
  template: `
    <div class="container mt-4 result-page">
    <div v-if="is_admin">
      <a_navbar></a_navbar>
    </div>
    <div v-else>
      <u_navbar></u_navbar>
    </div>
      <br>
      <div class="result-summary text-center p-4 rounded shadow bg-light">
        <h1 class="text-primary fw-bold">Quiz Results</h1>
        <p class="fs-4 fw-bold">Score: <span class="text-success">{{ score }}</span> / {{ totalMarks }}</p>
        <p class="fs-5">Time Taken: <span class="fw-bold">{{ formattedTime }}</span></p>
      </div>

      <div class="feedback-container mt-5">
      <div>
        <h2 class="text-center text-secondary" v-if="is_admin">User Attempt</h2>
        <h2 class="text-center text-secondary" v-else>Your Attempt</h2>
      </div>
        <div v-for="(question, index) in feedback" :key="index" class="card mt-3 shadow-sm">
          <div class="card-body">
            <h5 class="card-title fw-bold">Q{{ index + 1 }}: {{ question.question_text }}</h5>
            <div class="attempted-answer mt-2">
              <span class="badge" :class="{'bg-success': question.is_correct, 'bg-danger': !question.is_correct}">
                {{ question.is_correct ? 'Correct' : 'Incorrect' }}
              </span>
            </div>

            <ul class="list-group mt-3">
              <li 
                v-for="(option, optIndex) in question.options" 
                :key="optIndex" 
                class="list-group-item"
                :class="getOptionClass(option, question)">
                {{ getOptionLetter(optIndex) }}. {{ option }}
              </li>
            </ul>

            <p class="text-muted mt-3"><strong>Explanation:</strong> {{ question.explanation }}</p>
            <p class="fw-bold">Score: <span class="text-primary">{{ question.attempt_score }}</span> / {{ question.question_score }}</p>
          </div>
        </div>
      </div>

      <button @click="goBack" class="btn btn-lg btn-outline-primary mt-4 w-100" v-if="shouldShowButton">All Quiz Attempts</button>
    </div>
  `,

  components: { u_navbar, a_navbar },

  data() {
    return {
      feedback: [],
      score: 0,
      totalMarks: 0,
      timeTaken: 0,
      attemptId: null,
      is_admin: false,
    };
  },

  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeTaken / 60);
      const seconds = this.timeTaken % 60;
      return `${minutes} min : ${seconds < 10 ? "0" : ""}${seconds} sec`;
    },

    shouldShowButton() {
      return !this.is_admin;
    },
  },

  methods: {
    async fetchResults() {
      this.attemptId = localStorage.getItem("attempt_id");
      const authToken = localStorage.getItem("auth_token");

      try {
        const res = await fetch(`/api/results/${this.attemptId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": authToken,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();

        this.feedback = data.details;
        this.score = data.total_score;
        this.totalMarks = data.total_marks;
        this.timeTaken = data.duration;

        if (localStorage.getItem("user_id") == 1) {
          this.is_admin = true;
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    },

    getOptionLetter(index) {
      return String.fromCharCode(65 + index); // A, B, C, D, etc.
    },

    getOptionClass(option, question) {
      if (option === question.correct_option)
        return "list-group-item-success fw-bold";
      if (option === question.selected_option) return "list-group-item-danger";
      return "";
    },

    goBack() {
      this.$router.push("/user_score");
    },
  },

  mounted() {
    this.fetchResults();
  },
};
