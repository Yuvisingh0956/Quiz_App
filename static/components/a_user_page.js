import a_navbar from "./a_navbar.js";

export default {
  template: `
    <div class="container mt-4">
      <a_navbar></a_navbar>
      <br>
      <div class="admin-users p-4 shadow rounded">
        <h1 class="text-center text-primary fw-bold">All Users</h1>

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
    </div>
  `,
  components: {
    a_navbar,
  },
  data() {
    return {
      users: [], // Full user list from API
      searchQuery: "", // Search input field
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
  },

  mounted() {
    this.fetchUsers();
  },
};
