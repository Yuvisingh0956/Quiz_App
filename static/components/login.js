export default {
  template: `
  <div class="container login-container bg-dark text-light mt-2 md-2">
    <div class="row">
      <div class="col-md-6 login-image ml-0">
        <img src="../static/login.jpg" alt="Login Image" class="img-fluid">
      </div>
      <div class="col-md-6 login-form" style="margin-top: 70px;">
        <h2 class="text-center mb-4">Sign In</h2>
        <div v-if="message" class="alert alert-danger text-center rounded-pill mb-4 mx-auto" style="width: 250px;">
          {{ message }}
        </div>
        <div class="mb-3">
          <label for="username" class="form-label">Email</label>
          <input type="email" class="form-control rounded-pill" id="email" v-model="formdata.email" placeholder="Email">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">PASSWORD</label>
          <input type="password" class="form-control rounded-pill" id="password" v-model="formdata.password" placeholder="Password">
        </div>
        <button class="btn btn-warning rounded-pill w-100 mb-3" @click="loginUser">Sign In</button>
        <p class="text-center">Not a member? <button @click="redirect" class="text-decoration-none bg-dark text-light">Sign Up</button></p>
      </div>
    </div>
  </div>`,
  data() {
    return {
      formdata: {
        email: "",
        password: "",
      },
      message: "",
    };
  },
  methods: {
    loginUser() {
      if (localStorage.getItem("auth_token")) {
        this.message = "You are already logged in. Please log out first.";
        return;
      }
      // Client-side validation:
      if (!this.formdata.email || !this.formdata.password) {
        this.message = "Please fill in all fields.";
        return; // Stop the function
      }
      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.formdata),
      })
        .then((response) => {
          if (response.ok) {
            // if (localStorage.getItem("auth_token")) {
            //   this.message = "user already logged in";
            //   return;
            // }
            return response.json();
          } else {
            return response.json().then((data) => {
              throw new Error(data.message || "Login failed"); // throw error with message from the backend.
            });
          }
        })
        .then((data) => {
          localStorage.setItem("auth_token", data.auth_token);
          localStorage.setItem("user_id", data.id);
          localStorage.setItem("username", data.username);
          if (data.role === "user") {
            this.$router.push("/dashboard");
          } else {
            this.$router.push("/a_dashboard");
          }
        })
        .catch((error) => {
          this.message = error.message; // set the error message.
          console.error("Login error:", error);
        });
    },
    redirect() {
      this.$router.push("/register");
    },
  },
};
