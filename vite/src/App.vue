<template>
  <div>
    <span>count is {{ count }}</span>
    <button @click="add">+1</button>
  </div>
</template>

<script>
import { ref } from "vue";
export default {
  setup(props) {
    const count = ref(6);
    function add() {
      count.value++;
    }
    return { count, add };
  },
};
</script>