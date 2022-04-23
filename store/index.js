export const state = () => ({
    sceneID: undefined,
    sceneSliders: [],
    pageURLs: [],
    mainSize: {w: 0, h: 0},
    interactiveSize: {w: 0, h: 0},
    articleSize: {w: 0, h: 0},
    sliderWidth: 130
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
    },
    setSliderWidth(state, w) {
        state.sliderWidth = w
    }
}