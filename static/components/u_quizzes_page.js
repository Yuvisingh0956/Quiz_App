import u_navbar from "./u_navbar.js";

export default {
  template: `
    <div class="container mt-4">
      <u_navbar></u_navbar>
      <h1 class="text-center text-primary fw-bold">Available Quizzes</h1>

      <!-- Search Bar -->
      <div class="mb-3">
        <input 
          v-model="searchQuery" 
          class="form-control" 
          placeholder="Search for a quiz..." 
        />
      </div>

      <table class="table table-striped mt-3">
        <thead>
          <tr>
            <th>Quiz Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Single Attempt</th>
            <th>Type</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="quiz in filteredQuizzes" :key="quiz.id">
            <td>{{ quiz.name }}</td>
            <td>{{ quiz.start_date }}</td>
            <td>{{ quiz.end_date }}</td>
            <td>{{ quiz.single_attempt }}</td>
            <td>
              <span v-if="quiz.type_of_quiz === 'Free'" class="badge bg-success">Free</span>
              <span v-else class="badge bg-warning">Paid</span>
            </td>
            <td>Rs. {{ quiz.price }}</td>
            <td>
              <span v-if="isYetToStart(quiz.start_date)" class="badge bg-primary bg-gradient">Yet to start</span>
              <span v-else-if="!isQuizActive(quiz.end_date)" class="badge bg-danger">Expired</span>
              <span v-else-if="quiz.single_attempt && quiz.attempted && quiz.is_paid" class="badge bg-secondary">Attempted</span>
              <button v-else-if="quiz.type_of_quiz === 'Paid' && !quiz.is_paid" 
                      class="btn btn-warning btn-sm" 
                      @click="payForQuiz(quiz)">
                Pay Rs. {{ quiz.price }}
              </button>
              <button v-else class="btn btn-primary btn-sm" @click="attemptQuiz(quiz.id)">
                Attempt
              </button>
            </td>

          </tr>
        </tbody>
      </table>

      <!-- Payment Modal -->
      <div v-if="showPaymentModal" class="modal-overlay">
        <div class="modal-content">
          <h3 class="text-success">Complete Payment</h3>
          <br>
          <br>
          <h5>Quiz: {{ selectedQuiz.name }}</h5>
          <h5>Amount: Rs. {{ selectedQuiz.price }}</h5>

          <label for="paymentMethod">Payment Method:</label>
          <select v-model="paymentMethod" class="form-control">
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="upi">UPI</option>
            <option value="paypal">PayPal</option>
          </select>

          <button class="btn btn-success mt-2" @click="confirmPayment">Pay Now</button>
          <button class="btn btn-secondary mt-2" @click="showPaymentModal = false">Cancel</button>
        </div>
      </div>
    </div>
  `,

  components: { u_navbar },

  data() {
    return {
      quizzes: [],
      searchQuery: "",
      showPaymentModal: false,
      selectedQuiz: null,
      paymentMethod: "credit_card", // Default payment method
    };
  },

  computed: {
    filteredQuizzes() {
      if (!this.searchQuery) {
        return this.quizzes;
      }
      return this.quizzes.filter((quiz) =>
        quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  methods: {
    async fetchQuizzes() {
      const authToken = localStorage.getItem("auth_token");
      const chapterId = this.$route.query.chapter_id;

      if (!chapterId) {
        console.error("Chapter ID missing in URL");
        return;
      }

      try {
        const res = await fetch(`/api/chapter/${chapterId}/quizzes`, {
          headers: { "Authentication-Token": authToken },
        });

        if (!res.ok) throw new Error("Failed to fetch quizzes");
        this.quizzes = await res.json();

        console.log("Fetched quizzes:", this.quizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    },

    attemptQuiz(quizId) {
      this.$router.push({
        path: "/quiz",
        query: { quiz_id: quizId },
      });
    },

    isYetToStart(startDate) {
      const now = new Date();
      const quizStart = new Date(startDate);
      return now < quizStart; // Returns true if the quiz has not started yet
    },

    isQuizActive(endDate) {
      const now = new Date();
      const quizEnd = new Date(endDate);
      return now < quizEnd; // Returns true if the quiz is still active
    },

    async payForQuiz(quiz) {
      const authToken = localStorage.getItem("auth_token");

      try {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": authToken,
          },
          body: JSON.stringify({
            quiz_id: quiz.id,
            amount: quiz.price,
          }),
        });

        const data = await res.json();
        if (data.success) {
          alert("Payment Successful!");
          this.fetchQuizzes(); // Refresh list to update payment status
        } else {
          alert("Payment Failed: " + data.message);
        }
      } catch (error) {
        console.error("Error processing payment:", error);
      }
    },

    payForQuiz(quiz) {
      this.selectedQuiz = quiz;
      this.showPaymentModal = true;
    },

    async confirmPayment() {
      const authToken = localStorage.getItem("auth_token");

      try {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": authToken,
          },
          body: JSON.stringify({
            quiz_id: this.selectedQuiz.id,
            amount: this.selectedQuiz.price,
            payment_method: this.paymentMethod,
          }),
        });

        const data = await res.json();
        if (data.success) {
          alert("Payment Successful!");
          this.showPaymentModal = false;
          this.fetchQuizzes(); // Refresh list
        } else {
          alert("Payment Failed: " + data.message);
        }
      } catch (error) {
        console.error("Error processing payment:", error);
      }
    },
  },

  mounted() {
    this.fetchQuizzes();
  },
};
