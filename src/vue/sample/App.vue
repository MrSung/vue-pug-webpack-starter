<template>
  <div>
    <h2 :class="$style.heading">{{ text }} from vue file</h2>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: 'Sample',
    };
  },
};
</script>

<style lang="scss" module>
.heading {
  color: cadetblue;
  font-weight: bold;
}
</style>
