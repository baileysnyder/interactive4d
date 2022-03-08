export const state = () => ({
    sceneID: undefined,
    sceneSliders: [],
    pageURLs: [],
    canvasSize: {h: 0, w: 0},
    articleSize: {h: 0, w: 0}
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
    setCanvasSize(state, d) {
        state.canvasSize = d
    },
    setArticleSize(state, d) {
        state.articleSize = d
    }
}