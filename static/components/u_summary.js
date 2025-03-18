import u_navbar from "./u_navbar.js";
// import Chart from "chart.js/auto";

export default {
  template: `
    <div class="container mt-4">
      <u_navbar></u_navbar>

      <h1 class="text-primary text-center fw-bold">Performance Summary</h1>

      <div class="row mt-4">
        <div class="col-md-6">
          <h3 class="text-secondary text-center">Subject-wise Performance</h3>
          <canvas id="subjectChart"></canvas>
        </div>

        <div class="col-md-6">
          <h3 class="text-secondary text-center">Recent Quiz Performance</h3>
          <canvas id="recentChart"></canvas>
        </div>
      </div>
    </div>
  `,

  components: {
    u_navbar,
  },

  data() {
    return {
      subjectPerformance: [],
      recentPerformance: [],
    };
  },

  methods: {
    async fetchSummary() {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        console.error("No auth token found. Please log in.");
        return;
      }

      try {
        const res = await fetch("/api/summary", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch summary data");

        const data = await res.json();
        this.subjectPerformance = data.subject_performance;
        this.recentPerformance = data.recent_performance;

        this.renderSubjectChart();
        this.renderRecentChart();
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    },

    renderSubjectChart() {
      const ctx = document.getElementById("subjectChart").getContext("2d");

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.subjectPerformance.map((s) => s.subject),
          datasets: [
            {
              label: "Average Score",
              data: this.subjectPerformance.map((s) => s.avg_score),
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    },

    renderRecentChart() {
      const ctx = document.getElementById("recentChart").getContext("2d");

      new Chart(ctx, {
        type: "line",
        data: {
          labels: this.recentPerformance.map((s) => s.quiz_name),
          datasets: [
            {
              label: "Score",
              data: this.recentPerformance.map((s) => s.score),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    },
  },

  mounted() {
    this.fetchSummary();
  },
};
