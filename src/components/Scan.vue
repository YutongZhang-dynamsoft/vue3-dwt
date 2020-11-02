<template>
  <div>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { WebTwain } from 'dwt/WebTwain'

const Scan = defineComponent({
  name: 'dwt-scan',
  props: {
    dwtObj: { type: WebTwain },
    width: { type: Number, default: 400 },
    height: { type: Number, default: 300 }
  }
})
export default Scan
</script>

<style scoped>

</style>
