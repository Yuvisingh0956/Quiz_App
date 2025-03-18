import u_navbar from "./u_navbar.js";

export default {
  template: `
    <div class="container mt-4">
      <u_navbar></u_navbar>
      <br>

      <!-- Search Bar -->
      <div class="mb-3">
        <input 
          v-model="searchQuery" 
          class="form-control" 
          placeholder="Search for a quiz..."
        />
      </div>

      <div class="attempts-container mt-4">
        <h2 class="text-center text-secondary">Your Past Attempts</h2>
        <table class="table table-striped mt-3">
          <thead class="table-dark">
            <tr>
              <th>#</th>
              <th>Quiz Name</th>
              <th>Score</th>
              <th>Total Marks</th>
              <th>Time Taken</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(attempt, index) in filteredAttempts" :key="attempt.attempt_id">
              <td>{{ index + 1 }}</td>
              <td>{{ attempt.quiz_name }}</td>
              <td class="fw-bold text-success">{{ attempt.score }}</td>
              <td>{{ attempt.total_marks }}</td>
              <td>{{ formatTime(attempt.duration) }}</td>
              <td>{{ attempt.date_of_quiz }}</td>
              <td>
                <button @click="viewResults(attempt.attempt_id)" class="btn btn-sm btn-primary">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  components: {
    u_navbar,
  },

  data() {
    return {
      attempts: [],
      searchQuery: "",
    };
  },

  computed: {
    filteredAttempts() {
      if (!this.searchQuery) {
        return this.attempts;
      }
      return this.attempts.filter((attempt) =>
        attempt.quiz_name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  methods: {
    async fetchAttempts() {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        console.error("No auth token found. Please log in.");
        return;
      }

      try {
        const res = await fetch("/api/past-attempts", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch attempts");

        const data = await res.json();
        this.attempts = data.attempts;
      } catch (error) {
        console.error("Error fetching past attempts:", error);
      }
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    },

    viewResults(attemptId) {
      localStorage.setItem("attempt_id", attemptId);
      this.$router.push({ path: "/results" });
    },
  },

  mounted() {
    this.fetchAttempts();
  },
};
