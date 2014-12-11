module.exports = function(grunt) {

    // 1. All configuration goes here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                  src: [
                    "jszip.2.4.0.min.js",
                    "browser.js",
                    "file-manager.js",
                    "visualizer.js",
                    "media.js",
                    "font.js",
                    "skin.js",
                    "multi-display.js",
                    "hotkeys.js",
                    "winamp.js"
                  ],
                  dest: 'production.js',
            }
        },
        uglify: {
            build: {
                src: 'production.js',
                dest: 'production.min.js'
            }
        },
        cssmin: {
            combine: {
                files: {
                    'production.min.css': ['winamp.css']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);

};
