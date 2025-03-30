import u_navbar from "./u_navbar.js";
import unauthorized_page from "./unauthorized_page.js";

export default {
  template: `
    <div v-if="is_authorized" class="container mt-4">
      <u_navbar></u_navbar>
      <br>
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">
                Chapters of {{ subjectName }}
              </h2>

              <!-- Search Bar -->
              <div class="mb-3">
                <input 
                  v-model="searchQuery" 
                  class="form-control" 
                  placeholder="Search for a chapter..." 
                />
              </div>

              <div v-if="filteredChapters.length > 0">
                <div class="list-group">
                  <div 
                    v-for="chapter in filteredChapters" 
                    :key="chapter.id" 
                    class="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5 class="mb-1">{{ chapter.name }}</h5>
                      <p class="mb-1">{{ chapter.description }}</p>
                    </div>
                    <button class="btn btn-sm btn-outline-success" @click="seeQuiz(chapter.id)">
                      See Quiz
                    </button>
                  </div>
                </div>
              </div>
              <div v-else>
                <p class="text-muted">No chapters available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <unauthorized_page v-else />
  `,

  components: { u_navbar, unauthorized_page },

  data() {
    return {
      is_authorized: false,
      subjectId: null,
      subjectName: "",
      chapters: [],
      searchQuery: "",
    };
  },

  computed: {
    filteredChapters() {
      if (!this.searchQuery) {
        return this.chapters;
      }
      return this.chapters.filter((chapter) =>
        chapter.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  mounted() {
    this.getSubjectId();
    this.checkAuthorization();
  },

  watch: {
    "$route.params.subject_id": {
      handler(newId) {
        this.subjectId = newId;
        this.fetchChapters();
      },
    },
  },

  methods: {
    checkAuthorization() {
      fetch("/api/user_check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.is_authorized = true;
            this.fetchChapters();
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
    getSubjectId() {
      this.subjectId = this.$route.query.subject_id;
      this.subjectName = this.$route.query.subject_name || "Unknown Subject";
      if (!this.subjectId) {
        console.error("❌ Error: subject_id not found in route.");
      }
    },

    async fetchChapters() {
      if (!this.subjectId) return;
      fetch(`/api/subject/${this.subjectId}/chapters`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.chapters = data;
        })
        .catch((error) => console.error("Error:", error));
    },

    seeQuiz(chapterId) {
      this.$router.push({
        path: "/u_quizzes",
        query: {
          chapter_id: chapterId,
          chapter_name: this.chapters.find((c) => c.id === chapterId)?.name,
        },
      });
    },
  },
};
