import u_navbar from "./u_navbar.js";

export default {
  template: `
      <div class="container mt-4 result-page">
        <u_navbar></u_navbar>
        <div class="result-summary text-center p-4 rounded shadow">
          <h1 class="text-primary fw-bold">Quiz Results</h1>
          <p class="fs-4 fw-bold">Score: <span class="text-success">{{ score }}</span> / {{ totalMarks }}</p>
          <p class="fs-5">Time Taken: {{ formattedTime }}</p>
        </div>
  
        <div class="feedback-container mt-4">
          <h2 class="text-center text-secondary">Your Attempt</h2>
          <div v-for="(question, index) in feedback" :key="index" class="question-card p-3 mt-3">
            <p class="fw-bold fs-5">Q{{ index + 1 }}: {{ question.question }}</p>
            <div class="attempted-answer mt-2">
              <span :class="{'text-success': question.is_correct, 'text-danger': !question.is_correct}">
                Your Answer: {{ getOptionLetter(question.user_answer) }}.  {{ question.user_answer_text }}
              </span>
            </div>
            <p class="text-primary">Correct Answer: {{ getOptionLetter(question.correct_answer) }}.  {{ question.correct_answer_text }}</p>
            <p class="text-muted feedback-text">Feedback: {{ question.feedback_text }}</p>
          </div>
        </div>
  
        <button @click="goBack" class="btn btn-lg btn-outline-primary mt-4 w-100">Back to Quiz List</button>
      </div>
    `,
  components: {
    u_navbar,
  },
  data() {
    return {
      feedback: [],
      score: 0,
      totalMarks: 0,
      timeTaken: 0,
    };
  },

  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeTaken / 60);
      const seconds = this.timeTaken % 60;
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    },
  },

  methods: {
    async fetchResults() {
      const quizId = this.$route.query.quiz_id;
      const authToken = localStorage.getItem("auth_token");

      try {
        const res = await fetch(`/api/quiz-results/${quizId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": authToken,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();

        this.feedback = data.feedback;
        this.score = data.score;
        this.totalMarks = data.total_marks;
        this.timeTaken = data.time_taken;
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    },

    getOptionLetter(index) {
      return String.fromCharCode(65 + index); // A, B, C, D, etc.
    },

    goBack() {
      this.$router.push("/quizzes");
    },
  },

  mounted() {
    this.fetchResults();
  },
};
