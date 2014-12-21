module.exports = function(grunt) {

    // 1. All configuration goes here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        htmlrefs: {
            dist: {
                src: '../index.html',
                dest: '../index.html',
                options: {
                    includes: {
                        analytics: './analytics.js'
                    }
                }
            }
        },
        inline: {
            dist: {
                options:{
                    tag: 'inline', // Inline all the things
                    uglify: true,
                    cssmin: true
                },
                src: [
                    '../css/winamp.css', // Inlines the cursor images
                    '../index.html'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-inline');
    grunt.loadNpmTasks('grunt-htmlrefs');

    grunt.registerTask('default', ['htmlrefs', 'inline']);

};
