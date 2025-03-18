import a_navbar from "./a_navbar.js";

export default {
  template: `
    <div class="container mt-4">
      <a_navbar></a_navbar>
      <br>
      <h1 class="text-center text-primary fw-bold">All Transactions</h1>

      <table class="table table-striped mt-3">
        <thead>
          <tr>
            <th>User</th>
            <th>Quiz Name</th>
            <th>Amount (Rs.)</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Transaction Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ transaction.user_name }}</td>
            <td>{{ transaction.quiz_name }}</td>
            <td>{{ transaction.amount }}</td>
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
  `,

  components: { a_navbar },

  data() {
    return {
      transactions: [],
    };
  },

  methods: {
    async fetchTransactions() {
      const authToken = localStorage.getItem("auth_token");

      try {
        const res = await fetch("/api/admin/transactions", {
          headers: { "Authentication-Token": authToken },
        });

        if (!res.ok) throw new Error("Failed to fetch transactions");
        this.transactions = await res.json();
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    },

    formatDate(dateStr) {
      return new Date(dateStr).toISOString().split("T")[0]; // ✅ Extracts only YYYY-MM-DD
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
    this.fetchTransactions();
  },
};
