export const state = () => ({
    sceneID: undefined,
    sceneSliders: [],
    pageURLs: [],
    canvasSize: {height: 0, width: 0},
    articleSize: {height: 0, width: 0}
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