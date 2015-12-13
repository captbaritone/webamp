({
    baseUrl: '../js/',
    name: '../rjs/almond',
    include: ['main'],
    out: '../bundle.js',
    wrap: true,
    exclude: ['../rjs/normalize'],
    pragmasOnSave: {
        excludeRequireCss: true
    }
})
