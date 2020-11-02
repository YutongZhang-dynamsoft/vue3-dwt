<template>
  <div>
    <DWTComposited license="t0139vQIAAI/eD5Rg0Ju95KGceid9QHNkVPV7VKFJi8jS6LHpPSdOGD6R8AAc7WrfPyx1V9Vs3GTTiVzarRk0L+KfRCKVTCnIJgZrA2RX0B75dNid0dzEs8k9VjA8M6+oyr6V+SKDut5h9DIYmI7zoGa4YDQ30Qvc9Ivn+fwaLhjNzTgf/znlJnYA3rKR3A=="
                   resourcePath="dwt-resources"
                    webTwainId="dwt-container"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DWTComposited from '@/components/DWTComposited.vue'

const View = defineComponent({
  name: 'composited-dwt',
  components: {
    DWTComposited
  }
})
export default View
</script>