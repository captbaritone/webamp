## TLDR;

You can ignore everything in this directory.

# Production

In production (http://jordaneldredge.com/projects/winamp.js/), I host a version
of the project that minifies and inlines many of the assets in improve load
time, and reduce load on my server. These files are used to build that version
production version of `index.html`.

If you have [Grunt](http://gruntjs.com) installed, you should be able to
generate the production build using these steps:

    cd production/
    npm install
    grunt



