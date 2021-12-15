<template>
<div>
    <h1>Interactive 4D Visualizer</h1>
    <h2>From Flatland to the Fourth Dimension</h2>
    <div id="main" :style="{'width': mainWidth + 'px', 'height': mainHeight + 'px'}">
        <nuxt />
    </div>
    <Navigation id="navigation"/>
    <p>Donate</p>
</div>
</template>

<script>
import Navigation from '../components/Navigation'

export default {
    components: {
        Navigation
    },
    data() {
        return {
            mainWidth: window.innerWidth - 150,
            mainHeight: window.innerHeight - 200
        }
    },
    mounted() {
        window.addEventListener('resize', this.onResize)
    },
    methods: {
        onResize() {
            this.mainWidth = window.innerWidth - 150
            this.mainHeight = window.innerHeight - 200

            let emit = {
                width: this.mainWidth,
                height: this.mainHeight
            }

            $nuxt.$emit('resize-main-container', emit)
        }
    }
}
</script>

<style scoped>
h1 {
    margin-bottom: 0;
}

h2 {
    margin-top: 0;
    font-style: italic;
}

#main {
    display: inline-block;
}

#navigation {
    display: inline-block;
    vertical-align: top;
    position: fixed;
    padding-left: 10px;
}
</style>