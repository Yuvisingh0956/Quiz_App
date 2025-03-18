export default {
  template: `
    <div class="quiz-container container mt-4">
      <!-- Fixed Timer (Top Left) -->
      <div class="fixed-timer">
        <span class="fw-bold">Time Left:</span>
        <span class="time badge bg-danger p-2 ms-2">{{ formattedTime }}</span>
      </div>

      <!-- Warning Message (Top Right Popup) -->
      <div v-if="showPrompt" class="warning-popup alert alert-warning">
        ⚠️ All questions must be attempted!
      </div>

      <div class="quiz-header text-center">
        <h1 class="text-primary fw-bold">Quiz Attempt</h1>
        <h2 class="mt-3">Quiz: {{ quiz.name }}</h2>
      </div>

      <div class="progress mt-3">
        <div class="progress-bar progress-bar-striped bg-primary" 
             :style="{ width: progress + '%' }"></div>
      </div>

      <div class="questions-container mt-4">
        <div v-for="(question, index) in questions" :key="question.id" class="question-card p-3">
          <p class="question-text fw-bold fs-5"><strong>Q{{ index + 1 }}:</strong> {{ question.question }}</p>
          <div class="options d-flex flex-column gap-3">
            <div v-for="(option, index_o) in question.options" 
                 :key="option" 
                 class="option-card p-3 rounded d-flex align-items-center justify-content-between"
                 :class="{ 'selected': userAnswers[question.id] === index_o }"
                 @click="selectOption(question.id, index_o)">
              <span class="option-label">{{ getOptionLetter(index_o) }}. </span>
              <span class="option-text flex-grow-1">{{ option }}</span>
            </div>
          </div>
        </div>
      </div>

      <button @click="validateAndSubmit" class="btn btn-lg btn-primary w-100 mt-4">Submit Quiz</button>

      <div v-if="feedback" class="feedback-modal">
        <div class="feedback-content">
          <h3 class="text-success">Quiz Results</h3>
          <p class="fw-bold">Score: {{ score }} / {{ totalMarks }}</p>
          <button @click="redirectToResults" class="btn btn-outline-primary">View Detailed Results</button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      quiz: {},
      questions: [],
      userAnswers: {},
      timer: 0,
      intervalId: null,
      showPrompt: false,
      feedback: null,
      score: 0,
      totalMarks: 0,
      attemptId: null, // Store attempt ID for submission
    };
  },

  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    },
    progress() {
      return (
        ((this.quiz.time_duration * 60 - this.timer) /
          (this.quiz.time_duration * 60)) *
        100
      );
    },
  },

  methods: {
    async fetchQuiz() {
      const quizId = this.$route.query.quiz_id;
      const authToken = localStorage.getItem("auth_token");

      if (!authToken) {
        console.error("❌ No authentication token found. Please log in.");
        return;
      }

      try {
        const quizResponse = await fetch(`/api/quizzes/quiz/${quizId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": authToken,
          },
        });

        if (!quizResponse.ok)
          throw new Error(`HTTP error! Status: ${quizResponse.status}`);
        this.quiz = await quizResponse.json();

        const questionsResponse = await fetch(`/api/attempt-quiz/${quizId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": authToken,
          },
        });

        if (!questionsResponse.ok)
          throw new Error(`HTTP error! Status: ${questionsResponse.status}`);
        const attempts = await questionsResponse.json();

        // if (attempts.length > 0) {
        //   this.attemptId = attempts[0].attempt_id; // Use the first attempt ID
        // }

        this.questions = attempts.map((attempt) => ({
          id: attempt.id,
          question: attempt.question,
          options: attempt.options,
        }));

        this.restoreTimer();
      } catch (error) {
        console.error("❌ Error fetching quiz data:", error);
      }
    },

    restoreTimer() {
      const savedTime = localStorage.getItem("quiz_timer");
      if (savedTime) {
        this.timer = parseInt(savedTime, 10);
      } else {
        this.timer = this.quiz.time_duration * 60;
      }

      this.intervalId = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
          localStorage.setItem("quiz_timer", this.timer);
        } else {
          this.submitQuiz();
        }
      }, 1000);
    },

    selectOption(questionId, optionIndex) {
      this.userAnswers[questionId] = optionIndex;
    },

    getOptionLetter(index) {
      return String.fromCharCode(65 + index); // A, B, C, D, etc.
    },

    validateAndSubmit() {
      const allAnswered = this.questions.every(
        (question) => this.userAnswers[question.id] !== undefined
      );
      if (!allAnswered) {
        this.showPrompt = true;
        setTimeout(() => {
          this.showPrompt = false;
        }, 3000);
        return;
      }
      this.submitQuiz();
    },

    async submitQuiz() {
      clearInterval(this.intervalId);
      localStorage.removeItem("quiz_timer");

      const quizId = this.$route.query.quiz_id;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        console.error("No auth token found. Please log in.");
        return;
      }

      try {
        const res = await axios.post(
          `/api/attempt-quiz`,
          {
            quiz_id: quizId,
            answers: this.userAnswers,
            duration: this.quiz.time_duration * 60 - this.timer,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": token,
            },
          }
        );
        this.feedback = res.data.feedback;
        this.score = res.data.score;
        this.totalMarks = res.data.total_marks;
        this.attemptId = res.data.attempt_id; // Store the attempt ID
        localStorage.setItem("attempt_id", this.attemptId);

        // Show blurred background (only behind the pop-up)
        this.$nextTick(() => {
          document.body.insertAdjacentHTML(
            "beforeend",
            '<div id="blur-overlay" class="blur-background"></div>'
          );
        });
      } catch (error) {
        console.error("Error submitting quiz", error);
      }
    },

    redirectToResults() {
      this.$router.push({
        path: "/results",
        // query: { quiz_id: this.$route.query.quiz_id },
      });
      this.removeBlurEffect();
    },

    removeBlurEffect() {
      const overlay = document.getElementById("blur-overlay");
      if (overlay) overlay.remove();
    },
  },

  mounted() {
    this.fetchQuiz();
    this.removeBlurEffect();
  },

  beforeUnmount() {
    this.removeBlurEffect();
  },
};
