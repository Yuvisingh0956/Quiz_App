import a_navbar from "./a_navbar.js";
import unauthorized_page from "./unauthorized_page.js";

export default {
  template: `
    <div v-if="is_authorized" class="container mt-4">
      <a_navbar></a_navbar>
      <br>
      <div v-if="user" class="user-details p-4 shadow rounded">
        <h1 class="text-center text-primary fw-bold">{{ user.name }}'s Profile</h1>
        
        <table class="table mt-3">
          <tbody>
            <tr><th>Name</th><td>{{ user.name }}</td></tr>
            <tr><th>Email</th><td>{{ user.email }}</td></tr>
            <tr><th>Role</th><td><span class="badge bg-info">{{ user.role }}</span></td></tr>
            <tr><th>Date of Birth</th><td>{{ user.dob }}</td></tr>
            <tr><th>Total Quizzes Attempted</th><td>{{ user.total_attempts }}</td></tr>
            <tr><th>Average Score</th><td>{{ user.average_score }}%</td></tr>
          </tbody>
        </table>

        <h2 class="text-secondary mt-4">Last 10 Quiz Attempts</h2>
        <table class="table table-striped mt-2">
          <thead>
            <tr>
              <th>Quiz Name</th>
              <th>Score</th>
              <th>Total Marks</th>
              <th>Attempt Date</th>
              <th>View Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attempt in user.last_attempts" :key="attempt.date_of_attempt">
              <td>{{ attempt.quiz_name }}</td>
              <td>{{ attempt.score }}</td>
              <td>{{ attempt.total_marks }}</td>
              <td>{{ attempt.date_of_attempt }}</td>
              <td>
                  <button class="btn btn-info btn-sm" @click="viewResult(attempt.attempt_id)">
                    View Details
                  </button>
                </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
    <unauthorized_page v-else />
  `,

  components: { a_navbar, unauthorized_page },

  data() {
    return {
      is_authorized : false,
      user: null,
    };
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
            this.fetchUserDetails();
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
    async fetchUserDetails() {
      const authToken = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("a_user_id");
      //   const userId = new URLSearchParams(window.location.search).get("user_id");

      if (!userId) {
        console.error("User ID missing in URL");
        return;
      }

      try {
        const res = await fetch(`/api/admin/user/${userId}`, {
          headers: { "Authentication-Token": authToken },
        });

        if (!res.ok) throw new Error("Failed to fetch user details");
        this.user = await res.json();
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    },

    viewResult(attemptId) {
      localStorage.setItem("attempt_id", attemptId);
      this.$router.push(`/results`);
      //   this.$router.push(`/admin/user-detail?user_id=${userId}`);
    },
  },

  mounted() {
    this.checkAuthorization();
  },
};
