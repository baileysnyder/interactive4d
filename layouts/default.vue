<template>
<div ref="topContainer">
    <h1>INTERACTIVE 4D VISUALIZER</h1>
    <div id="main-content" :style="{'width': mainSize.w + 'px', 'height': mainSize.h + 'px'}">
          <div class="wrapper" ref="wrapper">
            <Interactive ref="interactive" class="resizable-box interactive-box" :style="{'width': interactiveSize.w + 'px'}" />
            <div @mousedown="onMousedownHandler" class="handler" >
                <svg class="handler-grip">
                    <rect x="21%" y="0" width="18%" height="100%" rx="4px" fill="rgb(56, 56, 56)" />
                    <rect x="61%" y="0" width="18%" height="100%" rx="4px" fill="rgb(56, 56, 56)" />
                </svg>
            </div>
            <div class="resizable-box article-box">
                <div class="article-box-in">
                    <div class="article-dark" :class="{'dark-overlay': burgerActive, 'no-p-events': !burgerActive}"  @click="burgerActive = false"></div>
                    <div class="nav-overlay" :class="{'overlay-move': burgerActive}">
                        <NuxtLink v-for="(page, index) in navPages" v-bind:key="page.title" :to="page.path" class="navlink" :class="{'top-link': index === 0}" @click.native="burgerActive = false">{{page.title}}</NuxtLink>
                    </div>
                    <button v-show="isNavHidden" class="nav-burger gray-rounded-button" :class="{'button-move': burgerActive}" @click="burgerActive = !burgerActive">
                        <svg v-show="!burgerActive" class="burger-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 490"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path fill="#e8e8e8" d="M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z"/></svg>
                        <svg v-show="burgerActive" viewBox="0 0 10 10">
                            <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="rgb(232, 232, 232)" stroke-linecap="round" stroke-width="1.2"/>
                            <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="rgb(232, 232, 232)" stroke-linecap="round" stroke-width="1.2"/>
                        </svg>
                    </button>
                    <nuxt class="article"/>                
                    <div class="navbar">
                        <NuxtLink :to="previousRoute" v-show="previousRoute !== ''">
                            <button class="nav-button previous-button gray-rounded-button" @click="burgerActive = false">← Prev</button>
                        </NuxtLink>
                        <NuxtLink :to="nextRoute" v-show="nextRoute !== ''">
                            <button class="nav-button next-button gray-rounded-button" @click="burgerActive = false">Next →</button>
                        </NuxtLink>
                    </div>
                </div>            
            </div>
        </div>
    </div>
    <Navigation ref="navigation" id="navigation"/>
    <div class="donation-section" :style="{'width': mainSize.w + 'px'}">
        <p class="donation-text">If you've found this site useful and would like to help support it please consider donating!</p>
        <form action="https://www.paypal.com/donate" method="post" target="_top">
            <input type="hidden" name="hosted_button_id" value="DZUQU9XR384U6" />
            <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
            <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
        </form>
    </div>
</div>
</template>

<script>
import Navigation from '../components/Navigation'
import Interactive from '../components/Interactive/Interactive'
import * as Constants from '../scripts/constants'
import {Dimensions} from '../scripts/util'

const minInteractiveWidth = 0.2

export default {
    components: {
        Navigation,
        Interactive
    },
    data() {
        return {
            isHandlerDragging: false,
            isNavHidden: true,
            burgerActive: false,
            navPages: Constants.navPages
        }
    },
    computed: {
        previousRoute() {
            for (let i = 0; i < Constants.navPages.length; i++) {
                if (Constants.navPages[i].path === this.$route.path) {
                    return i > 0 ? Constants.navPages[i-1] : ''
                }
            }
        },
        nextRoute() {
            for (let i = 0; i < Constants.navPages.length; i++) {
                if (Constants.navPages[i].path === this.$route.path) {
                    return i < Constants.navPages.length-1 ? Constants.navPages[i+1] : ''
                }
            }
        },
        interactiveSize() {
            return this.$store.state.interactiveSize
        },
        mainSize() {
            return this.$store.state.mainSize
        }
    },
    mounted() {
        //this.storeSizes(this.interactiveWidth, this.interactiveHeight)
        window.addEventListener('resize', this.onResize)

        const vueContext = this
        const interactive = this.$refs.interactive.$el
        const topContainer = this.$refs.topContainer
        const wrapper = this.$refs.wrapper
        document.addEventListener('mouseup', function(e) {
            vueContext.isHandlerDragging = false
            topContainer.removeEventListener('mousemove', preventEvent)
        })

        document.addEventListener('mousemove', function(e) {
            // Don't do anything if dragging flag is false
            if (!vueContext.isHandlerDragging) {
                return false
            }

            // Get offset
            let containerOffsetLeft = wrapper.offsetLeft

            // Get x-coordinate of pointer relative to container
            let pointerRelativeXpos = e.clientX - containerOffsetLeft
            
            // Arbitrary minimum width set on box A, otherwise its inner content will collapse to width of 0
            let minWidth = vueContext.mainSize.w * minInteractiveWidth
            let maxWidth = vueContext.mainSize.w - minWidth

            // Resize box A
            // * 8px is the left/right spacing between .handler and its inner pseudo-element
            let width = pointerRelativeXpos - 8
            if (width < minWidth) {
                width = minWidth
            } else if (width > maxWidth) {
                width = maxWidth
            }

            interactive.style.width = width + 'px'

            vueContext.storeSizes(vueContext.mainSize.w, vueContext.mainSize.h, width, vueContext.mainSize.h)       
        })
    },
    methods: {
        onMousedownHandler(e) {
            this.isHandlerDragging = true
            const topContainter = this.$refs.topContainer

            topContainter.addEventListener('mousemove', preventEvent)
        },
        onResize() {
            let mainW = window.innerWidth - Constants.navigationWidth
            let mainH = window.innerHeight - Constants.headerFooterHeight

            this.storeSizes(mainW, mainH, mainW/2, mainH)
        },
        storeSizes(mainW, mainH, interactiveW, interactiveH) {
            let mSize = new Dimensions(mainW, mainH)
            this.$store.commit('setMainSize', mSize)


            let iSize = new Dimensions(interactiveW, interactiveH)
            this.$store.commit('setInteractiveSize', iSize)


            let articleWidth = this.mainWidth === interactiveW ? interactiveW : this.mainWidth - interactiveW
            let articleHeight = this.mainHeight === interactiveH ? interactiveH : this.mainHeight - interactiveH
            let aSize = new Dimensions(articleWidth, articleHeight)
            this.$store.commit('setArticleSize', aSize)
        }
    }
}

let preventEvent = function(e) {
    e.preventDefault()
}
</script>

<style scoped>
h1 {
    margin-bottom: 6px;
    margin-left: 8px;
    font-style: italic;
}

#main-content {
    display: inline-block;
    border-radius: 16px;
    overflow: hidden;
    /* box-shadow: 6px 6px 3px rgba(0, 0, 0, 0.5); */
}

#navigation {
    display: inline-block;
    vertical-align: top;
    position: fixed;
    padding-left: 6px;
    margin-top: 16px;
}

.wrapper {
  display:flex;
  height: 100%;

  background: rgb(36, 36, 36);
}

.resizable-box {
  box-sizing: border-box;
}

.interactive-box {
  flex: 0 0 auto;
}

.article-box {
    flex: 1 1 auto;
}

.article {
    height: 95%;
    display: flex;
    flex-flow: column;
    background: rgb(24, 24, 24);
}

.nav-button {
    padding-left: 8px;
    padding-right: 8px;
    height: 60%;
    width: 80px;

    position: relative;
    top: 50%;
    transform: translateY(-50%);
}

.next-button {
    float: right;
    margin-right: 15px;
}

.previous-button {
    float: left;
    margin-left: 6px;
}

.navbar {
    height: 5%;
    background: rgb(32, 32, 32);
    position: absolute;
    width: 100%;
}

.handler {
  width: 18px;
  padding: 0;
  cursor: ew-resize;
  flex: 0 0 auto;

  display: flex;
  align-items: center;
}

/* .handler::before {
  content: '';
  display: block;
  height: 100%;
  margin: 0 auto;
} */

.handler-grip {
    width: 100%;
    height: 4%;
}

.donation-section {
    text-align: center;
}

.donation-text {
    margin-top: 5px;
    margin-bottom: 3px;
    font-size: 13px;
    color: rgb(160, 160, 160);
}

.article-box-in {
    position: relative;
    height: 100%;
    width: 100%;
}

.nav-burger {
    position: absolute;
    right: 14px;
    top: 14px;
    width: 40px;
    height: 40px;
    transition: right 0.5s;
}

.burger-icon {
    width: 90%;
    height: 90%;
}

.nav-overlay {
    position: absolute;
    top: 0;
    right: -234px;
    width: 234px;
    height: 95%;
    margin: 0;
    list-style: none;
    background: rgb(26, 26, 26);
    transition: right 0.5s;
}

.overlay-move {
    right: 0;
    box-shadow: -4px 0 6px rgb(0 0 0 / 50%);
}

.button-move {
    right: 248px;
}

.article-dark {
    width: 100%;
    height: 95%;
    position: absolute;
    background-color: rgba(0, 0, 0, 0);
    transition: background-color 0.4s;
}

.dark-overlay {
    background-color: rgba(0, 0, 0, 0.8);
}

.no-p-events {
    pointer-events: none;
}

.navlink {
    display: block;
    color: rgb(232, 232, 232);
    text-decoration: none;
    padding-left: 14px;
    padding-top: 8px;
}

.top-link {
    padding-top: 14px;
}

</style>

<style>
/* global styling */
body {
    background: rgb(46, 46, 46);
    color: rgb(232, 232, 232);
    font-family: 'Open Sans';
}

h1, h2, .navlink, button {
    font-family: 'Karla';
}

.article-header {
    text-align: center;
}

.article p {
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 10px;
    margin-top: 10px;
}

.article ol, .article ul {
    margin-left: 30px;
}

.article .main-content {
  overflow-y: auto;
    padding-bottom: 50px;
}

.img-wide {
    margin: auto;
    display: block;
    margin-top: 12px;
    margin-bottom: 26px;
    width: 70%;
    max-width: 400px;
    border: solid 2px rgb(100, 100, 100);
    border-radius: 8px;
    /* box-shadow: 4px 4px 5px rgb(0 0 0 / 50%); */
}

.img-300 {
    margin: auto;
    display: block;
    margin-top: 12px;
    margin-bottom: 26px;
    width: 70%;
    max-width: 300px;
    border: solid 2px rgb(100, 100, 100);
    border-radius: 8px;
    /* box-shadow: 4px 4px 5px rgb(0 0 0 / 50%); */
}

.gray-rounded-button {
    background: rgb(60, 60, 60);
    color: rgb(232, 232, 232);
    border: none;
    border-radius: 5px;
    box-shadow: 2px 2px 3px rgb(0 0 0 / 50%);
}

.gray-rounded-button:hover {
  background: rgb(75, 75, 75);
}

/* Scrollbar */
/* Works on Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: lightgray gray;
}

/* Works on Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 14px;
}

*::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 20px;
}

*::-webkit-scrollbar-thumb {
  background-color: gray;
  border-radius: 20px;
}

.cube0 {
    background: #FF7E47;
}

.cube1 {
    background: #31a25e;
}

.cube2 {
    background: #90210f;
}

.cube3 {
    background: #783f6b;
}

.cube4 {
    background: #efa7a7;
}

.cube5 {
    background: #abc8c0;
}

.cube6 {
    background: #1f5673;
}

.cube7 {
    background: #57540f;
}

a {
    color: #62DDE5;
}
</style>