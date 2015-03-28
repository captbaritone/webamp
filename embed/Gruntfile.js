module.exports = function(grunt) {

    // 1. All configuration goes here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            js: {
                // the files to concatenate
                src: [
                    '../js/jszip.2.4.0.min.js',
                    '../js/browser.js',
                    '../js/file.js',
                    '../js/visualizer.js',
                    '../js/media.js',
                    '../js/font.js',
                    '../js/skin-sprites.js',
                    '../js/skin.js',
                    '../js/multi-display.js',
                    '../js/hotkeys.js',
                    '../js/context.js',
                    '../js/window-manager.js',
                    '../js/main-window.js',
                    '../js/winamp.js',
                    '../js/embed.js'
                ],
                // the location of the resulting JS file
                dest: '../embed.js'
            },
            css: {
                // the files to concatenate
                src: [
                    '../css/winamp.css',
                    '../css/main.css',
                    '../css/context-menu.css'
                ],
                // the location of the resulting JS file
                dest: '../embed.css'
            }
        },
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/* http://jordaneldredge.com/projects/winamp2-js/ */\n'
            },
            dist: {
                files: {
                    '../embed.min.js': ['../embed.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);

};
