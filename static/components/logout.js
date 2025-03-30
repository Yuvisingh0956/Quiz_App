export default {
  template: `
    <div class="container text-center mt-5">
      <h2 class="mb-4">Logging you out...</h2>
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `,

  mounted() {
    this.logoutUser();
  },

  methods: {
    logoutUser() {
      fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`, // If token-based auth is required
        },
      })
        .then((response) => {
          if (response.ok) {
            this.clearSessionAndRedirect();
          } else {
            return response.json().then((data) => {
              throw new Error(data.message || "Logout failed");
            });
          }
        })
        .catch((error) => {
          console.error("Logout error:", error);
          this.clearSessionAndRedirect(); // Even if logout fails, clear local data and redirect
        });
    },

    clearSessionAndRedirect() {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("username");

      // Redirect to login page
      this.$router.push("/login");
    },
  },
};
