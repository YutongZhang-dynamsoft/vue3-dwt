# How to make Dynamic Web TWAIN reusable with composition API of Vue.js 3

The composition API is a new feature that aims to resolve reusability issue. 
Our developers may use the Dynamic Web TWAIN in various projects with some similar logics. 
Extracting the repeatable piece of code could improve the maintainability. 
**In this article, we are going to extract the initialization process using composition API.** If we successfully did it, each time we use Dynamic Web TWAIN in the Vue.js project just requires us to load the script in a fixed pattern.

## What is Composition API

### Introduction

[Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html) is a new mechanism to resolve the maintainability and flexibility issue in Vue.js project. In Vue.js 2, we decouple the logic with mixins, HOC, and Renderless Components. The injection of mixin and HOC could lead to namespace conflict. Furthermore, the Renderless Components is not the most efficient solution towards reusability issue.

### Sample Code

```js
import { fetchUserRepositories } from '@/api/repositories'
import { ref } from 'vue'

export default {
  components: { RepositoriesFilters, RepositoriesSortBy, RepositoriesList },
  props: {
    user: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const repositories = ref([])
    const getUserRepositories = async () => {
      repositories.value = await fetchUserRepositories(props.user)
    }

    return {
      repositories,
      getUserRepositories
    }
  },
  data () {
    return {
      filters: { ... }, // 3
      searchQuery: '' // 2
    }
  },
  computed: {
    filteredRepositories () { ... }, // 3
    repositoriesMatchingSearchQuery () { ... }, // 2
  },
  watch: {
    user: 'getUserRepositories' // 1
  },
  methods: {
    updateFilters () { ... }, // 3
  },
  mounted () {
    this.getUserRepositories() // 1
  }
}
```

The sample code comes from the official documentation. The new hook `setup` is the entry of Composition API. `setup` will be invoked before the instance creation but after the `props` initialization. During this process, the instance reference `this` does not exist. We use a diagram to visualize the life cycle of a component in Vue.js 3.

> Diagram

## Implementing with Composition API

### Design

The initialization process of Dynamic Web TWAIN is as follows.

```
Load the library --> Load the resources --> Specify the license --> Configure the parameters --> Create the instance
```
