import u_navbar from "./u_navbar.js";
import unauthorized_page from "./unauthorized_page.js";

export default {
  template: `
    <div v-if="is_authorized" class="container mt-4">
      <u_navbar></u_navbar>
      <h1 class="text-center text-primary fw-bold">My Transactions</h1>

      <table class="table table-striped mt-3">
        <thead>
          <tr>
            <th>Quiz Name</th>
            <th>Amount (Rs.)</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Transaction Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ transaction.quiz_name }}</td>
            <td>Rs. {{ transaction.amount }}</td>
            <td>{{ formatPaymentMethod(transaction.payment_method) }}</td>
            <td>
              <span v-if="transaction.status === 'Completed'" class="badge bg-success">Completed</span>
              <span v-else class="badge bg-warning">Pending</span>
            </td>
            <td>{{ formatDate(transaction.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <unauthorized_page v-else />
  `,

  components: { u_navbar, unauthorized_page },

  data() {
    return {
      is_authorized: false,
      transactions: [],
    };
  },

  methods: {
    checkAuthorization() {
      fetch("/api/user_check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.is_authorized = true;
            this.fetchTransactions();
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
    async fetchTransactions() {
      const authToken = localStorage.getItem("auth_token");

      try {
        const res = await fetch("/api/user/transactions", {
          headers: { "Authentication-Token": authToken },
        });

        if (!res.ok) throw new Error("Failed to fetch transactions");
        this.transactions = await res.json();
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    },

    formatDate(dateStr) {
      return new Date(dateStr).toISOString().split("T")[0]; // Extracts only YYYY-MM-DD
    },

    formatPaymentMethod(method) {
      const methods = {
        credit_card: "Credit Card",
        debit_card: "Debit Card",
        upi: "UPI",
        paypal: "PayPal",
      };
      return methods[method] || "Unknown";
    },
  },

  mounted() {
    this.checkAuthorization();
  },
};
