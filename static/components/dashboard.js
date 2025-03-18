import u_navbar from "./u_navbar.js";

export default {
  template: `
    <div class="container mt-4">
      <u_navbar></u_navbar>
      <br>
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">
                Welcome {{ userData && userData.username ? userData.username : 'User' }}
              </h2>
              
              <!-- Search Bar -->
              <div class="mb-3">
                <input 
                  v-model="searchQuery" 
                  class="form-control" 
                  placeholder="Search for a subject..." 
                />
              </div>

              <div class="row">
                <div class="col-12">
                  <div class="card mb-4">
                    <div class="card-header bg-dark text-white">Subjects</div>
                    <div class="card-body">
                      <div v-if="filteredSubjects.length > 0">
                        <div class="row">
                          <div v-for="s in filteredSubjects" :key="s.id" class="col-md-6 mb-3">
                            <div class="border rounded p-2">
                              <h5 class="card-title">{{ s.name }}</h5>
                              <p class="card-text">{{ s.description }}</p>
                              <button class="btn btn-sm btn-outline-primary" @click="goToChapters(s.id, s.name)">
                                Explore
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else>
                        <p class="text-muted">No subjects available.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  components: { u_navbar },

  data() {
    return {
      userData: "",
      subjects: [],
      searchQuery: "",
    };
  },

  computed: {
    filteredSubjects() {
      if (!this.searchQuery) {
        return this.subjects;
      }
      return this.subjects.filter((s) =>
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  mounted() {
    fetch("/api/home", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authentication-Token": localStorage.getItem("auth_token"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.userData = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    fetch("/api/subject", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authentication-Token": localStorage.getItem("auth_token"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.subjects = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  },

  methods: {
    goToChapters(subjectId, subjectName) {
      this.$router.push({
        name: "UserChaptersPage",
        query: { subject_id: subjectId, subject_name: subjectName },
      });
    },
  },
};
