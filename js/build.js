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
            name: 'embed-built',
            create: true,
            include: [
                'almond',
                'embed'
            ]
        }
    ],
    map: {
        '*': {
            'css': 'css'
        }
    }
})
