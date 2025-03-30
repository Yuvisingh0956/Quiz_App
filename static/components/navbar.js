export default {
  template: `
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fs-3 fw-bold" to="/"> Quizo </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link btn btn-outline-primary me-2" to="/login">Login</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link btn btn-warning" to="/register">Signup</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  `,
};
