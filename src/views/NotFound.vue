<template>
     <div class="not-found-container">
          <p class="code" aria-hidden="true">404</p>
          <h1>Page Not Found</h1>
          <p class="text">Oops! The page you are looking for doesn't exist or has been moved.</p>
          <router-link to="/" class="home-link">
               Go back to Home Page
          </router-link>
     </div>
</template>

<style scoped>
.not-found-container {
     text-align: center;
     padding: 100px 20px;
}

.code {
     font-size: 6rem;
     font-weight: 700;
     line-height: 1.1;
     color: #e74c3c;
}

h1 {
     font-size: 2rem;
     color: #2c3e50;
     margin-bottom: 20px;
}

.text {
     font-size: 1.2rem;
     color: #666;
     margin-bottom: 30px;
}

.home-link {
     display: inline-block;
     padding: 12px 24px;
     background-color: #2b78a8;
     color: white;
     text-decoration: none;
     border-radius: 8px;
     font-weight: bold;
     transition: background-color 0.2s;
}

.home-link:hover {
     background-color: #20607f;
}
</style>
