import * as Constants from '../scripts/constants'
import { Dimensions } from '~/scripts/util'

export const state = () => ({
    sceneID: undefined,
    sceneSliders: [],
    pageURLs: [],
    mainSize: new Dimensions(window.innerWidth - Constants.navigationWidth, window.innerHeight - Constants.headerFooterHeight),
    interactiveSize: new Dimensions((window.innerWidth - Constants.navigationWidth) / 2, window.innerHeight - Constants.headerFooterHeight),
    articleSize: new Dimensions((window.innerWidth - Constants.navigationWidth) / 2, window.innerHeight - Constants.headerFooterHeight)
})

export const mutations = {
    updateScene(state, sceneID) {
        state.sceneID = sceneID
    },
    updateSceneSlider(state, sliderState) {
        state.sceneSliders[sliderState.sceneID] = sliderState
    },
    setPageURLs(state, urls) {
        state.pageURLs = urls
    },
    setMainSize(state, d) {
        state.mainSize = d
    },
    setInteractiveSize(state, d) {
        state.interactiveSize = d
    },
    setArticleSize(state, d) {
        state.articleSize = d
    }
}