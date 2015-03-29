({
    appDir: "../",
    baseUrl: "js/",
    include: "main",
    wrap: true,
    dir: "../../winamp2-js-prod",
    optimizeCss: "standard",
    removeCombined: true,
    modules: [
        { name: 'main' },
        {
            name: 'almond',
            include: 'embed',
        }
    ],
    map: {
        '*': {
            'css': 'css'
        }
    }
})
