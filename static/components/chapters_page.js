export default {
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">
                Chapters of {{ subjectName }}
              </h2>
              <button class="btn btn-primary mb-3" @click="openAddChapterModal">Add Chapter</button>
              <div v-if="chapters && chapters.length > 0">
                <div class="list-group">
                  <div v-for="chapter in chapters" :key="chapter.id" class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h5 class="mb-1">{{ chapter.name }}</h5>
                      <p class="mb-1">{{ chapter.description }}</p>
                    </div>
                    <div>
                      <button class="btn btn-sm btn-outline-primary me-2" @click="editChapter(chapter)">Edit</button>
                      <button class="btn btn-sm btn-outline-danger me-2" @click="deleteChapter(chapter.id)">Delete</button>
                      <button class="btn btn-sm btn-outline-success" @click="seeQuiz(chapter.id)">See Quiz</button>
                    </div>
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

      <!-- Add/Edit Chapter Modal -->
      <div v-if="showChapterModal" class="modal fade show d-block">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editingChapter ? 'Edit Chapter' : 'Add Chapter' }}</h5>
              <button type="button" class="btn-close" @click="closeChapterModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="chapterName" class="form-label">Chapter Name</label>
                <input type="text" class="form-control" id="chapterName" v-model="chapterData.name">
              </div>
              <div class="mb-3">
                <label for="chapterDesc" class="form-label">Description</label>
                <textarea class="form-control" id="chapterDesc" v-model="chapterData.description"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeChapterModal">Cancel</button>
              <button type="button" class="btn btn-primary" @click="saveChapter">{{ editingChapter ? 'Update' : 'Create' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      subjectId: null,
      subjectName: "",
      chapters: [],
      showChapterModal: false,
      showAddChapterModal: false,
      editingChapter: false,
      chapterData: {
        id: null,
        name: "",
        description: "",
      },
    };
  },

  mounted() {
    this.getSubjectId();
    this.fetchChapters();
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
    getSubjectId() {
      // Fix: Ensure Vue Router has correctly passed the param
      this.subjectId = this.$route.query.subject_id;
      this.subjectName = this.$route.query.subject_name || "Unknown Subject";
      // console.log(this.$route.query.subject_name);
      // console.log("Subject ID:", this.subjectId);
      // console.log(`/api/subject/${this.subjectId}/chapters`);
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
    editChapter(chapter) {
      this.chapterData = { ...chapter };
      this.editingChapter = true;
      this.showChapterModal = true;
    },
    deleteChapter(chapterId) {
      if (!confirm("Are you sure you want to delete this chapter?")) return;
      fetch(`/api/chapter/${chapterId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
      })
        .then((response) => response.json())
        .then(() => {
          this.fetchChapters();
        })
        .catch((error) => console.error("Error:", error));
    },
    openAddChapterModal() {
      this.showChapterModal = true;
      this.editingChapter = false;
      this.chapterData = { id: null, name: "", description: "" };
    },
    saveChapter() {
      const method = this.editingChapter ? "PUT" : "POST";
      const url = this.editingChapter
        ? `/api/chapter/${this.chapterData.id}`
        : `/api/subject/${this.subjectId}/chapters`;

      fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
        body: JSON.stringify({
          name: this.chapterData.name,
          description: this.chapterData.description,
          subject_id: this.subjectId, // Ensure subject ID is passed
        }),
      })
        .then((response) => response.json())
        .then(() => {
          this.closeChapterModal();
          this.fetchChapters();
        })
        .catch((error) => console.error("Error:", error));
    },

    closeChapterModal() {
      this.showChapterModal = false;
      this.editingChapter = false;
      this.chapterData = { id: null, name: "", description: "" };
    },
    seeQuiz(chapterId) {
      this.$router.push({
        path: "/quizzes",
        query: {
          chapter_id: chapterId,
          chapter_name: this.chapters.find((c) => c.id === chapterId)?.name,
        },
      });
    },
  },
};
