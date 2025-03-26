import a_navbar from "./a_navbar.js";
import unauthorized_page from "./unauthorized_page.js";

export default {
  template: `
  <div v-if="is_authorized">
    <div  class="container mt-4">
      <a_navbar></a_navbar>
      <br>
      <div class="d-flex align-items-center mt-4">
          <div class="flex-grow-1 text-center">
              <h1 class="text-primary fw-bold">All Users</h1>
          </div>
          <div>
              <button class="btn btn-outline-primary btn-sm px-3 shadow-sm" @click="exportCSV">
                  <i class="fas fa-download"></i> Export CSV
              </button>
          </div>
      </div>
      <!-- Search Bar -->
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control"
          v-model="searchQuery"
          placeholder="Search by name, email, or role..."
        />
        <button class="btn btn-outline-secondary" @click="clearSearch">Clear</button>
      </div>

      <table class="table table-striped mt-4">
        <thead class="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Date of Birth</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in filteredUsers" :key="user.id">
            <td>{{ index + 1 }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="getRoleClass(user.role)">
                {{ user.role }}
              </span>
            </td>
            <td>{{ user.dob }}</td>
            <td>
              <button class="btn btn-info btn-sm" @click="viewUser(user.id)">
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="filteredUsers.length === 0" class="text-center text-muted">No users found.</p>
    </div>

    <div v-if="notification" class="alert alert-success position-fixed top-0 end-0 m-3" role="alert">
      {{ notification }}
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
      is_authorized : false,
      users: [], // Full user list from API
      searchQuery: "", // Search input field
      notification: ""
    };
  },

  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
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
            this.fetchUsers();
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
    async fetchUsers() {
      const authToken = localStorage.getItem("auth_token");
      try {
        const res = await fetch("/api/admin/users", {
          headers: { "Authentication-Token": authToken },
        });

        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        this.users = data.users;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    viewUser(userId) {
      localStorage.setItem("a_user_id", userId);
      this.$router.push(`/admin/user-detail`);
    },

    getRoleClass(role) {
      switch (role.toLowerCase()) {
        case "admin":
          return "bg-danger text-white";
        case "user":
          return "bg-primary text-white";
        default:
          return "bg-secondary text-white";
      }
    },

    clearSearch() {
      this.searchQuery = "";
    },

    exportCSV(){
      fetch('/api/admin_export')
      .then(response => response.json())
      .then(data => {
        window.location.href = `/api/admin_csv_result/${data.id}`
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
