<template>
  <div id="nav">
    <router-link to="/">Conventional</router-link> |
    <router-link to="/composition">Composition API Test</router-link>
    <h1>Dynamic Web TWAIN DEMO with Vue.js 3</h1>
    <p>Typescript enabled</p>
  </div>
  <router-view/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const App = defineComponent({
  name: 'app'
})
export default App
</script>

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
  font-size: 1.4rem;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
