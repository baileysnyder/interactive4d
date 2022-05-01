export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  router: {
    base: '/interactive-4d/',
    trailingSlash: true,
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Interactive 4D Handbook',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=no' },
      { hid: 'og:title', property: 'og:title', content: 'Interactive 4D Handbook'},
      { hid: 'og:type', property: 'og:type', content: 'website'},
      { hid: 'og:image', property: 'og:image', content: 'https://baileysnyder.com/interactive-4d/wide_tesseract.png'},
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' },
      { rel: 'apple-touch-icon', href:'apple-touch-icon.png' },
      { rel: 'manifest', href:'site.webmanifest' },
      { rel: 'mask-icon', href:'safari-pinned-tab.svg' },
      { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com'},
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Karla'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Open+Sans'
      }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // transpile: ['three/examples/jsm/controls/OrbitControls', 'three/examples/jsm/lines/LineGeometry', 'three/examples/jsm/lines/LineMaterial', 'three/examples/jsm/lines/Line2', 'three/examples/jsm/loaders/GLTFLoader']
  }
}
