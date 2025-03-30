import a_navbar from "./a_navbar.js";
import unauthorized_page from "./unauthorized_page.js";

export default {
  template: `
    <div v-if="is_authorized" class="container mt-4">
      <a_navbar></a_navbar>
      
      <br>
      <!-- Summary Stats -->
      <div class="row text-center mb-4">
        <div class="col-md-3">
          <div class="summary-card shadow-sm p-3 rounded bg-light">
            <h5>Total Users</h5>
            <p class="fs-3 text-primary fw-bold">{{ totalUsers }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card shadow-sm p-3 rounded bg-light">
            <h5>Total Subjects</h5>
            <p class="fs-3 text-primary fw-bold">{{ totalSubjects }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card shadow-sm p-3 rounded bg-light">
            <h5>Total Chapters</h5>
            <p class="fs-3 text-primary fw-bold">{{ totalChapters }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card shadow-sm p-3 rounded bg-light">
            <h5>Total Quizzes</h5>
            <p class="fs-3 text-primary fw-bold">{{ totalQuizzes }}</p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="row">
        <!-- Subject Performance (Bar Chart) -->
        <div class="col-md-6">
          <div class="chart-container shadow-sm p-3 rounded">
            <h5 class="text-center">Subject-Wise Performance</h5>
            <canvas id="subjectPerformanceChart"></canvas>
          </div>
        </div>

        <!-- Qualification Distribution (Pie Chart) -->
        <div class="col-md-6">
          <div class="chart-container shadow-sm p-3 rounded">
            <h5 class="text-center">User Qualification Distribution</h5>
            <canvas id="qualificationChart"></canvas>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <!-- Recent Quiz Attempts (Line Chart) -->
        <div class="col-md-12">
          <div class="chart-container shadow-sm p-3 rounded">
            <h5 class="text-center">Recent Quiz Participation</h5>
            <canvas id="recentQuizChart"></canvas>
          </div>
        </div>
      </div>
    </div>
    <unauthorized_page v-else/>
  `,

  components: {
    a_navbar,
    unauthorized_page
  },

  data() {
    return {
      is_authorized: false,
      totalUsers: 0,
      totalSubjects: 0,
      totalChapters: 0,
      totalQuizzes: 0,
      subjectPerformance: {},
      qualificationDistribution: {},
      recentQuizAttempts: {},
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
            this.fetchSummary();
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
    async fetchSummary() {
      const authToken = localStorage.getItem("auth_token");
      try {
        const res = await fetch("/api/admin-summary", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": authToken,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch summary data");
        const data = await res.json();

        this.totalUsers = data.total_users;
        this.totalSubjects = data.total_subjects;
        this.totalChapters = data.total_chapters;
        this.totalQuizzes = data.total_quizzes;
        this.subjectPerformance = data.subject_performance;
        this.qualificationDistribution = data.qualification_distribution;
        this.recentQuizAttempts = data.recent_quiz_attempts;

        this.renderCharts();
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    },

    renderCharts() {
      // Subject Performance Bar Chart
      new Chart(document.getElementById("subjectPerformanceChart"), {
        type: "bar",
        data: {
          labels: Object.keys(this.subjectPerformance),
          datasets: [
            {
              label: "Average Score",
              data: Object.values(this.subjectPerformance),
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: { responsive: true },
      });

      // Qualification Distribution Pie Chart
      new Chart(document.getElementById("qualificationChart"), {
        type: "pie",
        data: {
          labels: Object.keys(this.qualificationDistribution),
          datasets: [
            {
              data: Object.values(this.qualificationDistribution),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"],
            },
          ],
        },
        options: { responsive: true },
      });

      // Recent Quiz Attempts Line Chart
      new Chart(document.getElementById("recentQuizChart"), {
        type: "line",
        data: {
          labels: Object.keys(this.recentQuizAttempts),
          datasets: [
            {
              label: "Attempts",
              data: Object.values(this.recentQuizAttempts),
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              fill: true,
            },
          ],
        },
        options: { responsive: true },
      });
    },
  },

  mounted() {
    this.checkAuthorization();
  },
};
