import NavBar from "../components/navbar.js";
import Footer from "../components/footer.js";

export default {
  template: `
        <div class="home-page">
            <div class="hero-section text-center">
                <h1 class="display-4">Welcome to Quizo</h1>
                <p class="lead">Your ultimate destination to quench the thirst for knowledge!</p>
                <div class="mt-4">
                    <button class="btn btn-primary btn-lg mx-2" @click="redirect_l">Login</button>
                    <button class="btn btn-outline-light btn-lg mx-2" @click="redirect_s">Sign Up</button>
                </div>
            </div>

            <div class="container subject-section">
                <h2 class="section-title text-center">Subjects Available</h2>
                <div class="row justify-content-center">
                    <div v-for="(subject, index) in subjects" :key="index" class="col-md-3 subject-card">
                        <div class="card-content">
                            <h5 class="subject-name">{{ subject.name }}</h5>
                            <p class="subject-description">{{ subject.description }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- New Section -->
            <div class="join-section">
                <div class="text-center">
                    <h2 class="section-title">Join Millions of Students in This Journey of Success</h2>
                    <div class="mt-4">
                        <button class="btn btn-primary btn-lg mx-2" @click="redirect_l">Login</button>
                        <button class="btn btn-outline-light btn-lg mx-2" @click="redirect_s">Sign Up</button>
                    </div>
                </div>
            </div>

            <foot></foot>
        </div>
    `,
  components: {
    "nav-bar": NavBar,
    foot: Footer,
  },
  data() {
    return {
      subjects: [],
    };
  },
  methods: {
    fetchSubjects() {
      fetch("/api/subject", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          this.subjects = data;
        })
        .catch((error) => {
          console.error("Error fetching subjects:", error);
        });
    },
    redirect_l() {
      this.$router.push("/login");
    },
    redirect_s() {
      this.$router.push("/register");
    },
  },
  mounted() {
    this.fetchSubjects();
  },
};
