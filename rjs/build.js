({
    appDir: "../",
    baseUrl: "js/",
    wrap: true,
    dir: "../../winamp2-js-prod",
    optimizeCss: "standard",
    removeCombined: true,
    modules: [
        { name: 'main' },
        {
            name: '../winamp2-js',
            create: true,
            include: [
                '../rjs/almond',
                'embed'
            ],
            exclude: ['../rjs/normalize']
        }
    ]
})
