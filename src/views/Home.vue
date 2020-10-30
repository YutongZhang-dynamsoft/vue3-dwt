<template>
  <div class="home">
    <DWT license="t0139vQIAAI/eD5Rg0Ju95KGceid9QHNkVPV7VKFJi8jS6LHpPSdOGD6R8AAc7WrfPyx1V9Vs3GTTiVzarRk0L+KfRCKVTCnIJgZrA2RX0B75dNid0dzEs8k9VjA8M6+oyr6V+SKDut5h9DIYmI7zoGa4YDQ30Qvc9Ivn+fwaLhjNzTgf/znlJnYA3rKR3A=="/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import DWT from '@/components/DWT.vue'; // @ is an alias to /src

@Options({
  components: {
    DWT,
  },
})
export default class Home extends Vue {}
</script>
