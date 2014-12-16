module.exports = function(grunt) {

    // 1. All configuration goes here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                  src: [
                    "js/jszip.2.4.0.min.js",
                    "js/browser.js",
                    "js/file-manager.js",
                    "js/visualizer.js",
                    "js/media.js",
                    "js/font.js",
                    "js/skin.js",
                    "js/multi-display.js",
                    "js/hotkeys.js",
                    "js/winamp.js"
                  ],
                  dest: 'js/production.js',
            }
        },
        uglify: {
            build: {
                src: 'js/production.js',
                dest: 'js/production.min.js'
            }
        },
        cssmin: {
            combine: {
                files: {
                    'css/production.min.css': ['css/winamp.css']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);

};
