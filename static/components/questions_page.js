import a_navbar from "./a_navbar.js";

export default {
  template: `
    <div class="container mt-4">
      <a_navbar></a_navbar>
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">Questions for Quiz {{ quizId }}</h2>
              <button class="btn btn-primary mb-3" @click="openAddQuestionModal">Add Question</button>
              <div v-if="questions.length > 0">
                <ul class="list-group">
                  <li v-for="question in questions" :key="question.id" class="list-group-item d-flex justify-content-between">
                    <div>
                      <small> <strong>{{ question.question }}</strong> </small>
                      <br>
                      <strong>Options: </strong>
                      <br>
                      <small>Option 1: {{question.option1}}</small>
                      <br>
                      <small>Option 2: {{question.option2}}</small>
                      <br>
                      <small>Option 3: {{question.option3}}</small>
                      <br>
                      <small>Option 3: {{question.option3}}</small>
                      <br>
                      <small>Correct Answer: {{ question.correct_option }}</small>
                      <br>
                      <small>Explanation: {{ question.explanation }}</small>
                      <br>
                      <small>Marks: {{ question.marks }}</small>
                    </div>
                    <div>
                      <button class="btn btn-sm btn-outline-primary me-2" @click="editQuestion(question)">Edit</button>
                      <button class="btn btn-sm btn-outline-danger" @click="deleteQuestion(question.id)">Delete</button>
                    </div>
                  </li>
                </ul>
              </div>
              <div v-else>
                <p class="text-muted">No questions available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showQuestionModal" class="modal fade show d-block">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editingQuestion ? 'Edit Question' : 'Add Question' }}</h5>
              <button type="button" class="btn-close" @click="closeQuestionModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="questionText" class="form-label">Question</label>
                <input type="text" class="form-control" id="questionText" v-model="questionData.question">
              </div>
              <div class="mb-3">
                <label class="form-label">Options</label>
                <div v-for="(option, index) in questionData.options" :key="index" class="mb-2">
                  <input type="text" class="form-control" v-model="questionData.options[index]" :placeholder="'Option ' + (index + 1)">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Correct Answer</label>
                <input type="text" class="form-control" v-model="questionData.correct_option">
              </div>
              <div class="mb-3">
                <label class="form-label">Explanation</label>
                <input type="text" class="form-control" v-model="questionData.explanation">
              </div>
              <div class="mb-3">
                <label class="form-label">Marks</label>
                <input type="number" class="form-control" v-model.number="questionData.marks">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeQuestionModal">Cancel</button>
              <button type="button" class="btn btn-primary" @click="saveQuestion">{{ editingQuestion ? 'Update' : 'Create' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  components: { a_navbar },

  data() {
    return {
      quizId: null,
      questions: [],
      showQuestionModal: false,
      editingQuestion: false,
      questionData: {
        id: null,
        quiz_id: null,
        question: "",
        options: ["", "", "", ""],
        correct_option: "",
        explanation: "",
        marks: 0,
      },
    };
  },

  mounted() {
    this.quizId = this.$route.query.quiz_id;
    if (!this.quizId) {
      console.error("❌ No quiz_id found in route.");
      return;
    }
    this.fetchQuestions();
  },

  methods: {
    async fetchQuestions() {
      try {
        const response = await fetch(`/api/quiz/${this.quizId}/questions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token"),
          },
        });
        if (!response.ok) throw new Error("Failed to fetch questions");
        this.questions = await response.json();
      } catch (error) {
        console.error("❌ Error fetching questions:", error);
      }
    },

    openAddQuestionModal() {
      this.questionData = {
        id: null,
        quiz_id: this.quizId,
        question: "",
        options: ["", "", "", ""],
        correct_option: "",
        explanation: "",
        marks: 0,
      };
      this.editingQuestion = false;
      this.showQuestionModal = true;
    },

    editQuestion(question) {
      this.questionData = {
        id: question.id,
        quiz_id: question.quiz_id,
        question: question.question,
        options: [
          question.option1,
          question.option2,
          question.option3,
          question.option4,
        ],
        correct_option: question[Object.keys(question)[4]],
        explanation: question.explanation,
        marks: question.marks,
      };
      this.editingQuestion = true;
      this.showQuestionModal = true;
    },

    async saveQuestion() {
      this.questionData.marks = Number(this.questionData.marks);

      // Convert options array to separate option properties
      const questionDataToSend = {
        ...this.questionData,
        option1: this.questionData.options[0],
        option2: this.questionData.options[1],
        option3: this.questionData.options[2],
        option4: this.questionData.options[3],
      };

      //Convert the correct_option string into the correct index.
      questionDataToSend.correct_option = this.questionData.options.indexOf(
        this.questionData.correct_option
      );

      // Remove the original options array
      delete questionDataToSend.options;

      const url = this.editingQuestion
        ? `/api/question/${this.questionData.id}`
        : `/api/quiz/${this.quizId}/questions`;
      const method = this.editingQuestion ? "PUT" : "POST";

      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token"),
          },
          body: JSON.stringify(questionDataToSend),
        });

        if (!response.ok) throw new Error("Failed to save question");

        this.fetchQuestions();
        this.closeQuestionModal();
      } catch (error) {
        console.error("❌ Error saving question:", error);
        alert(`Error: ${error.message}`);
      }
    },

    async deleteQuestion(questionId) {
      if (!confirm("Are you sure you want to delete this question?")) return;

      try {
        const response = await fetch(`/api/question/${questionId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token"),
          },
        });

        if (!response.ok) throw new Error("Failed to delete question");

        this.fetchQuestions();
      } catch (error) {
        console.error("❌ Error deleting question:", error);
        alert("Error deleting question.");
      }
    },

    closeQuestionModal() {
      this.showQuestionModal = false;
    },
  },
};
