<template>
    <div class="button-row">
      <button class="load-button" @click="clickAction">
        <span class="button-text">{{text}}</span>
        <img class="button-image" :src="'/_nuxt/assets/load-scene-images/' + imgName" />
      </button>
    </div>
    <!-- <div class="button-box" @click="initSliceHypercube">
      <div class="button-wrapper">
        <img class="button-image2" src="~assets/load-scene-images/slice_cube.png">
        <button class="button2">LOAD SLICE CUBE</button>
      </div>
    </div> -->
</template>

<script>
export default {
    props: {
        clickAction: Function,
        text: String,
        imgName: String,
    }
}
</script>

<style scoped>
.load-button {
  width: 200px;
  text-align: center;
  background: rgb(60, 60, 60);
  color: white;
  border: none;
  border-radius: 10px;

    display: flex;
  align-items: center;
}

.load-button:hover {
  background: rgb(75, 75, 75);
}

.button-row {
  display: flex;
  justify-content: center;
  margin: 8px;
}

.button-image {
  border-radius: 8px;
  width: 40%;
  float: right;

  padding-top: 4px;
  padding-bottom: 4px;
}

.button-text {
  width: 60%;
  float: left;
  font-weight: 600;
}
</style>