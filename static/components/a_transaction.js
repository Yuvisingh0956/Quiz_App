import a_navbar from "./a_navbar.js";
import unauthorized_page from "./unauthorized_page.js";

export default {
  template: `
    <div v-if="is_authorized" class="container mt-4">
      <a_navbar></a_navbar>
      
      <div class="d-flex justify-content-between align-items-center mt-4">
        <h1 class="text-primary fw-bold">All Transactions</h1>
        <button class="btn btn-outline-primary btn-sm px-3 shadow-sm" @click="exportCSV">
          <i class="fas fa-download"></i> Export CSV
        </button>
      </div>

      <div class="card shadow-sm mt-3">
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead class="table-light">
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
      </div>
      <div v-if="notification" class="alert alert-success position-fixed top-0 end-0 m-3" role="alert">
        {{ notification }}
      </div>
    </div>
    <unauthorized_page  v-else/>
  `,

  components: { a_navbar, unauthorized_page },

  data() {
    return {
      is_authorized: false,
      transactions: [],
      notification: ""
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

    exportCSV(){
      fetch('/api/export')
      .then(response => response.json())
      .then(data => {
        window.location.href = `/api/transaction_csv_result/${data.id}`
        this.showNotification("File exported successfully.");
      })
      .catch(error => console.error("Export failed:", error));
    },

    showNotification(message) {
      this.notification = message;
      setTimeout(() => {
        this.notification = "";
      }, 3000);
    }
  },

  mounted() {
    this.checkAuthorization();
  },
};
