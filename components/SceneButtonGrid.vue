<template>
  <table ref="table">
        <tbody>
          <tr v-for="(e, row) in rows" v-bind:key="row">
            <td v-for="(e, col) in columns" v-bind:key="col">
                <div v-if="(row*columns)+col < buttonData.length" :class="{'center': columns === 1, 'right': columns === 2 && col === 0}">
                    <LoadSceneButton :sceneID="buttonData[(row*columns)+col].sceneID" :text="buttonData[(row*columns)+col].text" :imgName="buttonData[(row*columns)+col].imgName"></LoadSceneButton>
                </div>
            </td>
          </tr>
        </tbody>
    </table>
</template>

<script>
import LoadSceneButton from '../components/LoadSceneButton'

const colBreakpoint1 = 500

export default {
    components: {
        LoadSceneButton
    },
    props: {
        buttonData: Array,
    },
    data() {
        return {
            columns: 1,
            rows: 1
        }
    },
    computed: {
        divWidth() {
            return this.$store.state.articleSize.w
        }
    },
    watch: {
        divWidth: function(newW, oldW) {
            this.calcDimensions(newW)
        }
    },
    methods: {
        calcDimensions(divWidth) {
            this.columns = 1
            if (divWidth > colBreakpoint1){
                this.columns += 1
            }

            this.rows = Math.ceil(this.buttonData.length / this.columns)
        }
    },
    mounted() {
        this.calcDimensions(this.$store.state.articleSize.w)
    }
}
</script>

<style>
table {
    width: 100%;
    padding: 18px;
}

td {
    text-align: center;
    padding: 6px;
    padding-left: 8px;
    padding-right: 8px;
}

.center {
    display: inline-block;
}

.right {
    float: right;
}
</style>