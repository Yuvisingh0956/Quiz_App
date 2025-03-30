export default {
  template: `
    <div class="container signup-container bg-dark text-light mt-2">
    <div class="row">
      <div class="col-md-6 signup-image">
        <img src="../static/signup.jpg" alt="Signup Image" class="img-fluid">
      </div>
      <div class="col-md-6 signup-form" style="margin-top: 50px;">
        <h2 class="text-center mb-4">Sign Up</h2>
        <div v-if="message" class="alert alert-danger text-center rounded-pill mb-4 mx-auto" style="width: 250px;">
          {{ message }}
        </div>
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input type="text" class="form-control rounded-pill" id="username" v-model="formdata.username" placeholder="Username" required>
        </div>
        <div class="mb-3">
          <label for="name" class="form-label">Name</label>
          <input type="text" class="form-control rounded-pill" id="name" v-model="formdata.name" placeholder="Name of User" required>
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control rounded-pill" id="email" v-model="formdata.email" placeholder="Email" required>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" class="form-control rounded-pill" id="password" v-model="formdata.password" placeholder="Password" required>
        </div>
        <div class="mb-3">
          <label for="qualification" class="form-label">Qualification</label>
          <input type="text" class="form-control rounded-pill" id="qualification" v-model="formdata.qualification" placeholder="Qualification" required>
        </div>
        <div class="mb-3">
          <label for="dob" class="form-label">Date of Birth</label>
          <input type="date" class="form-control rounded-pill" id="dob" v-model="formdata.dob" placeholder="Date of Birth" required>
        </div>
        <button class="btn btn-primary rounded-pill w-100 mb-3" @click="registerUser">Sign Up</button>
        <p class="text-center">Already a member? <button @click="redirect" class="text-decoration-none bg-dark text-light">Log In</button></p>
      </div>
    </div>
  </div>
    `,

  data() {
    return {
      formdata: {
        email: "",
        password: "",
        username: "",
        name: "",
        qualification: "",
        dob: "",
      },
      message: "",
    };
  },
  methods: {
    registerUser() {
      // Client-side validation:
      if (
        !this.formdata.email ||
        !this.formdata.password ||
        !this.formdata.username ||
        !this.formdata.name ||
        !this.formdata.qualification ||
        !this.formdata.dob
      ) {
        this.message = "Please fill in all fields.";
        return; // Stop the function
      }

      // Reset message if validation passes:
      this.message = "";
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.formdata), // the content goes to backend in JSON format
      })
        .then((response) => {
          if (response.ok) {
            alert("Signup successful! Please process to login");
            return response.json();
          } else {
            return response.json().then((data) => {
              throw new Error(data.message || "Signup failed"); // throw error with message from the backend.
            });
          }
        })
        .then((data) => {
          this.$router.push("/login");
        })
        .catch((error) => {
          this.message = error.message; // set the error message.
          console.error("Signup error:", error);
        });
    },
    redirect() {
      this.$router.push("/login");
    },
  },
};
