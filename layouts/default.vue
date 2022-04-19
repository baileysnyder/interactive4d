<template>
<div ref="topContainer" class="top-container">
    <h1 ref="header">INTERACTIVE 4D VISUALIZER</h1>
    <div id="main-content">
        <div class="wrapper" :class="{'vert-wrapper': isVerticalLayout, 'horiz-wrapper': !isVerticalLayout} " ref="wrapper">
            <Interactive ref="interactive" class="resizable-box interactive-box" :style="{'width': interactiveSize.w + 'px', 'height': interactiveSize.h + 'px'}"/>
            <div @pointerdown="onMousedownHandler" class="handler-horiz" v-show="!isVerticalLayout">
                <svg class="handler-grip-horiz">
                    <rect x="21%" y="0" width="18%" height="100%" rx="4px" fill="rgb(56, 56, 56)" />
                    <rect x="61%" y="0" width="18%" height="100%" rx="4px" fill="rgb(56, 56, 56)" />
                </svg>
            </div>
            <div @pointerdown="onMousedownHandler" class="handler-vert" v-show="isVerticalLayout">
                <svg class="handler-grip-vert">
                    <rect x="0" y="21%" width="100%" height="18%" rx="4px" fill="rgb(56, 56, 56)" />
                    <rect x="0" y="61%" width="100%" height="18%" rx="4px" fill="rgb(56, 56, 56)" />
                </svg>
            </div>
            <div class="resizable-box article-box">
                <div class="article-box-in">
                    <div class="article-dark" :class="{'dark-overlay': burgerActive, 'no-p-events': !burgerActive}"  @click="burgerActive = false"></div>
                    <div class="nav-overlay" :class="{'overlay-move': burgerActive}">
                        <div class="nav-spacer"></div>
                        <NuxtLink v-for="page in navPages" v-bind:key="page.title" :to="page.path" class="navlink" @click.native="burgerActive = false">{{page.title}}</NuxtLink>
                        <div class="nav-spacer"></div>
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
    <Navigation ref="navigation" id="navigation" v-show="!isNavHidden"/>
    <div ref="footer" class="donation-section">
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
            navPages: Constants.navPages,
            isVerticalLayout: false
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
        this.onResize()
        window.addEventListener('resize', this.onResize)     

        const vueContext = this
        const topContainer = this.$refs.topContainer
        const wrapper = this.$refs.wrapper
        document.addEventListener('pointerup', function(e) {
            vueContext.isHandlerDragging = false
            topContainer.removeEventListener('pointermove', preventEvent)
        })

        document.addEventListener('pointermove', function(e) {

            // Don't do anything if dragging flag is false
            if (!vueContext.isHandlerDragging) {
                return false
            }

            if (vueContext.isVerticalLayout) {
                dragVertical(e, vueContext, wrapper)
            } else {
                dragHorizontal(e, vueContext, wrapper)
            }
        })
    },
    methods: {
        onMousedownHandler(e) {
            this.isHandlerDragging = true
            const topContainter = this.$refs.topContainer

            topContainter.addEventListener('pointermove', preventEvent)
        },
        onResize() {
            this.burgerActive = false

            const mainH = this.$refs.wrapper.clientHeight
            let mainW = undefined

            // hard coded yumm
            const wPadding = 20
            const navW = 210
            const minArticleWidth = 475

            const mainWNoNav = window.innerWidth - wPadding
            const mainWYesNav = mainWNoNav - navW

            if (mainWNoNav > mainH) {
                this.isVerticalLayout = false
                this.isNavHidden = mainWYesNav/2 < minArticleWidth               
            }
            else {
                this.isVerticalLayout = true
                this.isNavHidden = mainWYesNav < minArticleWidth
            }

            mainW = this.isNavHidden ? mainWNoNav : mainWYesNav
            let interactW = this.isVerticalLayout ? mainW : mainW/2
            let interactH = this.isVerticalLayout ? mainH/2 : mainH

            this.storeSizes(mainW, mainH, interactW, interactH)
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

function dragHorizontal(e, vueContext, wrapper) {
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

    vueContext.storeSizes(vueContext.mainSize.w, vueContext.mainSize.h, width, vueContext.mainSize.h)   
}

function dragVertical(e, vueContext, wrapper) {

    let containerOffsetTop = wrapper.offsetTop
    let pointerRelativeYpos = e.clientY - containerOffsetTop
    
    let minH = vueContext.mainSize.h * minInteractiveWidth
    let maxH = vueContext.mainSize.h - minH

    let h = pointerRelativeYpos - 8
    if (h < minH) {
        h = minH
    } else if (h > maxH) {
        h = maxH
    }

    vueContext.storeSizes(vueContext.mainSize.w, vueContext.mainSize.h, vueContext.mainSize.w, h)   
}
</script>

<style scoped>
h1 {
    margin-top: 18px;
    margin-bottom: 6px;
    margin-left: 8px;
    font-style: italic;
    grid-column: 1 / 3;
    grid-row: 1;
}

@media screen and (max-width: 600px) {
  h1 {
    font-size: 24px;
  }
}

@media screen and (max-width: 800px) {
  h1 {
    margin-top: 8px;
  }
}

#main-content {
    grid-column: 1;
    grid-row: 2;
    border-radius: 16px;
    overflow: hidden;
    /* height: 100%; */
    /* box-shadow: 6px 6px 3px rgba(0, 0, 0, 0.5); */
}

#navigation {
    grid-column: 2;
    grid-row: 2;
    padding-left: 6px;
    padding-top: 6px;
}

.wrapper {
  display:flex;
  height: 100%;

  background: rgb(36, 36, 36);
}

.vert-wrapper {
    flex-direction: column;
}

.horiz-wrapper {
    flex-direction: row;
}

.resizable-box {
  box-sizing: border-box;
}

.interactive-box {
  flex: 0 0 auto;
}

.article-box {
    flex: 1 1 auto;
    min-height: 0;
}

.article {
    height: calc(100% - 40px);
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
    margin-left: 15px;
}

.navbar {
    height: 40px;
    background: rgb(32, 32, 32);
    position: absolute;
    width: 100%;
}

.handler-horiz {
  width: 18px;
  padding: 0;
  cursor: ew-resize;
  flex: 0 0 auto;

  display: flex;
  align-items: center;
  justify-content: center;
}

.handler-vert {
    height: 18px;
    padding: 0;
    cursor: ns-resize;
    flex: 0 0 auto;

    display: flex;
    align-items: center;
    justify-content: center;
}

/* .handler::before {
  content: '';
  display: block;
  height: 100%;
  margin: 0 auto;
} */

.handler-grip-horiz {
    width: 100%;
    height: 40px;
}

.handler-grip-vert {
    height: 100%;
    width: 40px;
}

.donation-section {
    text-align: center;
    grid-column: 1;
    grid-row: 3;
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
    right: -230px;
    width: 230px;
    height: calc(100% - 40px);
    margin: 0;
    list-style: none;
    background: rgb(26, 26, 26);
    transition: right 0.5s;
    overflow: auto;
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
    height: calc(100% - 40px);
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
    padding-bottom: 4px;
    padding-top: 4px;
}

a.navlink:hover {
    color: rgb(170, 170, 170);
}

.top-link {
    padding-top: 14px;
}

.top-container {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 10px;
    box-sizing: border-box;
}

.nav-spacer {
    height: 10px;
}

</style>

<style>
/* global styling */

html, body, #__nuxt, #__layout {
    height: 100%;
}

body {
    background: rgb(46, 46, 46);
    color: rgb(232, 232, 232);
    font-family: 'Open Sans';
    margin: 0;
    touch-action: none;
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
    margin-right: 20px;
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