<template>
  <button class="load-button" :class="{'active': isActive, 'inactive': !isActive}" @click="updateScene">
    <span class="button-text">{{buttonText}}</span>
    <div class="img-box">
      <img class="button-image" :src="require(`~/assets/load-scene-images/${imgName}`)" :alt="altText">
      <div class="button-image"></div>
    </div>
  </button>
</template>

<script>
export default {
    props: {
        sceneID: Number,
        text: String,
        imgName: String,
    },
    computed: {
      isActive() {
        return this.$store.state.sceneID === this.sceneID
      },
      buttonText() {
        if (!this.isActive || this.text !== "LOAD SCENE") {
          return this.text
        } else {
          return "SCENE LOADED"
        }
      },
      altText() {
        let dotIndex = this.imgName.length - 4        
        if (this.imgName.charAt(dotIndex) === '.') {
          return this.imgName.substring(0, dotIndex)
        } else {
          return this.imgName
        }
      }
    },
    methods: {
      updateScene() {
        this.$store.commit('updateScene', this.sceneID)
      }
    }
}
</script>

<style scoped>
.load-button {
  width: 200px;
  text-align: center;
  border: none;
  border-radius: 10px;

  display: flex;
  align-items: center;
  box-shadow: 3px 3px 3px rgb(0 0 0 / 50%);
}

.inactive {
  background: rgb(60, 60, 60);
  color: white;
}

.inactive:hover {
  background: rgb(75, 75, 75);
}

.active {
  background: rgb(209, 209, 209);
  color: rgb(30, 30, 30);
}

.img-box {
  border-radius: 8px;
  width: 76px;
  height: 57px;
  float: right;

  margin-top: 4px;
  margin-bottom: 4px;
  overflow: hidden;
}

.button-image {
  width:100%;
  height: 100%;
  background: black;
}

.button-text {
  width: 60%;
  float: left;
  font-weight: 600;
}
</style>