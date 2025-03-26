import a_navbar from "./a_navbar.js";
import unauthorized_page from "./unauthorized_page.js"

export default {
  template: `
      <div v-if="is_authorized" class="container mt-4">
        <a_navbar></a_navbar>
        <br>
        <div class="row justify-content-center ">
          <div class="col-md-8 ">
            <div class="card shadow">
              <div class="card-body">
                <h2 class="card-title text-center mb-4">
                  Welcome Admin
                </h2>
                
                <div class="row">
                  <div class="col-12">
                    <div class="card mb-4">
                      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <span>Subjects</span>
                        <button class="btn btn-primary btn-sm" @click="openAddSubjectModal">Add Subject</button>
                      </div>

                      <!-- Search Bar -->
                      <div class="p-3">
                        <input 
                          v-model="searchQuery" 
                          class="form-control" 
                          placeholder="Search for a subject..."
                        />
                      </div>

                      <div class="card-body">
                        <div v-if="filteredSubjects.length > 0">
                          <div class="row">
                            <div v-for="s in filteredSubjects" :key="s.id" class="col-md-6 mb-3">
                              <div class="border rounded p-2">
                                <h5 class="card-title">{{ s.name }}</h5>
                                <p class="card-text">{{ s.description }}</p>
                                <button class="btn btn-sm btn-outline-primary" @click="goToChapters(s.id, s.name)">Explore</button>
                                <button class="btn btn-sm btn-warning mx-1" @click="editSubject(s)">Edit</button>
                                <button class="btn btn-sm btn-danger" @click="deleteSubject(s.id)">Delete</button>
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

        <!-- Add/Edit Subject Modal -->
        <div v-if="showModal" class="modal" tabindex="-1" style="display: block;">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ editingSubject ? 'Edit Subject' : 'Add Subject' }}</h5>
                <button type="button" class="btn-close" @click="closeModal"></button>
              </div>
              <div class="modal-body">
                <label>Name:</label>
                <input v-model="subjectData.name" class="form-control" type="text" />
                <label>Description:</label>
                <input v-model="subjectData.description" class="form-control" type="text" />
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeModal">Cancel</button>
                <button class="btn btn-primary" @click="saveSubject">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <unauthorized_page v-else />
    `,
  components: { a_navbar, unauthorized_page },
  data() {
    return {
      is_authorized: false,
      subjects: [],
      searchQuery: "",
      showModal: false,
      showAddSubjectModal: false,
      subject_id: null,
      subject_name: null,
      editingSubject: false,
      subjectData: { name: "", description: "" },
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
    this.checkAuthorization();
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
            this.fetchSubjects();
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
    goToChapters(subjectId, subjectName) {
      localStorage.setItem("subject_id", subjectId)
      this.$router.push({
        name: "ChaptersPage",
        query: { subject_id: subjectId, subject_name: subjectName },
      });
    },
    fetchSubjects() {
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
        .catch((error) => console.error("Error:", error));
    },
    editSubject(subject) {
      this.subjectData = { ...subject };
      this.editingSubject = true;
      this.showModal = true;
    },
    deleteSubject(id) {
      if (confirm("Are you sure you want to delete this subject?")) {
        fetch(`/api/subject/${id}`, {
          method: "DELETE",
          headers: {
            "Authentication-Token": localStorage.getItem("auth_token"),
          },
        })
          .then((response) => response.json())
          .then(() => this.fetchSubjects())
          .catch((error) => console.error("Error:", error));
      }
    },
    openAddSubjectModal() {
      this.showModal = true;
      this.editingSubject = false;
      this.subjectData = { name: "", description: "" };
    },
    saveSubject() {
      const method = this.editingSubject ? "PUT" : "POST";
      const endpoint = this.editingSubject
        ? `/api/subject/${this.subjectData.id}`
        : "/api/subject";

      fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
        body: JSON.stringify(this.subjectData),
      })
        .then((response) => response.json())
        .then(() => {
          this.fetchSubjects();
          this.closeModal();
        })
        .catch((error) => console.error("Error:", error));
    },
    closeModal() {
      this.showModal = false;
      this.subjectData = { name: "", description: "" };
      this.editingSubject = false;
    },
  },
};
