export default {
    template: `
      <div class="container text-center mt-5">
        <div class="card shadow p-4">
          <h1 class="text-danger">🚫 Access Denied</h1>
          <p class="mt-3">You do not have permission to access this page. Please log in to continue.</p>
          <button class="btn btn-sm btn-outline-primary" @click="redirectLogin()">Log in</button>
        </div>
      </div>
    `,
    methods: {
        redirectLogin(){
            this.$router.push("/login")
        }
    },
  };
  