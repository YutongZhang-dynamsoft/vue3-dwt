<template>
  <div id="nav">
<!--    <router-link to="/">Dynamic Web TWAIN DEMO with Vue.js 3</router-link>-->
    <h1>Dynamic Web TWAIN DEMO with Vue.js 3</h1>
    <p>Typescript enabled</p>
  </div>
  <router-view/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
