import a_navbar from "./a_navbar.js";
import unauthorized_page from "./unauthorized_page.js";

export default {
  template: `
      <div v-if="is_authorized" class="container mt-4">
        <a_navbar></a_navbar>
        <br>
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card shadow">
              <div class="card-body">
                <h2 class="card-title text-center mb-4">Quiz for {{ chapterName }}</h2>
                <button class="btn btn-primary mb-3" @click="openAddQuizModal">Add Quiz</button>

                <!-- Search Input -->
                <input
                  type="text"
                  class="form-control mb-3"
                  placeholder="Search quiz..."
                  v-model="searchQuery"
                />

                <div v-if="filteredQuizzes.length > 0">
                  <ul class="list-group">
                    <li v-for="quiz in filteredQuizzes" :key="quiz.id" class="list-group-item d-flex justify-content-between align-items-center">
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
                        <span class="badge" :class="{
                            'bg-dark bg-gradient' : quiz.yet_to_start,
                            'bg-success': !quiz.is_expired,
                            'bg-danger': quiz.is_expired,
                          }"
                          >{{ quiz.yet_to_start ? 'Yet to start' : quiz.is_expired ? 'Expired' : 'Active' }}</span
                        >
                        <button class="btn btn-sm btn-outline-info me-2" @click="viewQuestions(quiz.id)">Questions</button>
                        <button class="btn btn-sm btn-outline-primary me-2" @click="editQuiz(quiz)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteQuiz(quiz.id)">Delete</button>
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

        <!-- Add/Edit Quiz Modal -->
        <div v-if="showQuizModal" class="modal fade show d-block">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ editingQuiz ? 'Edit Quiz' : 'Add Quiz' }}</h5>
                <button type="button" class="btn-close" @click="closeQuizModal"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label for="quizDate" class="form-label">Quiz Name</label>
                  <input type="text" class="form-control" id="name" v-model="quizData.name">
                </div>
                <div class="mb-3">
                  <label for="quizDate" class="form-label">Start Date</label>
                  <input type="date" class="form-control" id="StartDate" v-model="quizData.start_date">
                </div>
                <div class="mb-3">
                  <label for="quizType" class="form-label">Type</label>
                  <select class="form-select" id="quizType" v-model="quizData.type_of_quiz">
                    <option value="Paid">Paid</option>
                    <option value="Free">Free</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="quizDuration" class="form-label">Time Duration (minutes)</label>
                  <input type="number" class="form-control" id="quizDuration" v-model="quizData.time_duration">
                </div>
                <div class="mb-3">
                  <label for="quizNumQts" class="form-label">Single attempt</label>
                  <select class="form-select" id="quizAttempt" v-model="quizData.single_attempt">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div class="mb-3">
                <label for="quizEndDate" class="form-label">End Date</label>
                <input type="date" class="form-control" id="quizEndDate" v-model="quizData.end_date">
                </div>
                <div class="mb-3">
                  <label for="price" class="form-label">Price (in Rs.)</label>
                  <input type="number" class="form-control" id="price" v-model="quizData.price" defaultValue="0" placeholder="0 (for Free quiz)">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeQuizModal">Cancel</button>
                <button type="button" class="btn btn-primary" @click="saveQuiz">{{ editingQuiz ? 'Update' : 'Create' }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <unauthorized_page v-else />
    `,
  components: {
    a_navbar, unauthorized_page
  },
  data() {
    return {
      is_authorized: false,
      chapterId: null,
      chapterName: "",
      quizzes: [],
      searchQuery: "", // Search input model
      showQuizModal: false,
      editingQuiz: false,
      quizData: {
        id: null,
        name: "",
        start_date: "",
        time_duration: 0,
        single_attempt: "",
        type_of_quiz: "Free",
        end_date: null,
        price: 0,
        yet_to_start: false,
        is_expired: false,
      },
    };
  },

  mounted() {
    this.chapterId = this.$route.query.chapter_id;
    this.chapterName = this.$route.query.chapter_name;

    if (!this.chapterId) {
      console.error("❌ No chapter_id found in route.");
      return;
    }
    this.checkAuthorization();
  },

  computed: {
    filteredQuizzes() {
      return this.quizzes.filter((quiz) =>
        quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  methods: {
    checkAuthorization() {
      fetch("/api/admin_check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.is_authorized = true;
            this.fetchQuizzes();
          } else {
            this.is_authorized = false;
            localStorage.removeItem("auth_token");
          }
        })
        .catch(() => {
          this.is_authorized = false;
          localStorage.removeItem("auth_token");
        });
    },
    async fetchQuizzes() {
      if (!this.chapterId) return;
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

    openAddQuizModal() {
      this.quizData = {
        id: null,
        name: "",
        start_date: "",
        time_duration: 0,
        single_attempt: "",
        type_of_quiz: "Free",
        end_date: null,
        price: 0,
      };
      this.editingQuiz = false;
      this.showQuizModal = true;
    },

    editQuiz(quiz) {
      this.quizData = { ...quiz, single_attempt: quiz.single_attempt };
      this.editingQuiz = true;
      this.showQuizModal = true;
    },

    saveQuiz() {
      const url = this.editingQuiz
        ? `/api/quiz/${this.quizData.id}`
        : `/api/chapter/${this.chapterId}/quizzes`;

      fetch(url, {
        method: this.editingQuiz ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
        body: JSON.stringify(this.quizData),
      })
        .then(() => {
          this.fetchQuizzes();
          this.closeQuizModal();
        })
        .catch((error) => console.error("❌ Error saving quiz:", error));
    },

    deleteQuiz(quizId) {
      fetch(`/api/quiz/${quizId}`, { method: "DELETE" })
        .then(() => this.fetchQuizzes())
        .catch((error) => console.error("❌ Error deleting quiz:", error));
    },

    closeQuizModal() {
      this.showQuizModal = false;
    },

    viewQuestions(quizId) {
      this.$router.push({ path: "/questions", query: { quiz_id: quizId } });
    },
  },
};
