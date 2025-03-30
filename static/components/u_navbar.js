export default {
  template: `
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <router-link class="navbar-brand" to="/">Quizo</router-link>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <router-link class="nav-link" to="/dashboard">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user_score">Scores</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/u_summary">Summary</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/user_transactions">Transactions</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/logout">Logout</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `,
};
