// Requirejs Configuration Options
require.config({
  // to set the default folder
  baseUrl: '../js', 
  // paths: maps ids with paths (no extension)
  paths: {
      'jasmine': ['../tests/lib/jasmine'],
      'jasmine-html': ['../tests/lib/jasmine-html'],
      'jasmine-boot': ['../tests/lib/boot']
  },
  // shim: makes external libraries compatible with requirejs (AMD)
  shim: {
    'jasmine-html': {
      deps : ['jasmine']
    },
    'jasmine-boot': {
      deps : ['jasmine', 'jasmine-html']
    }
  }
});

require(['jasmine-boot'], function () {
    require([
        '../tests/spec/media'
    ], function(){
        //trigger Jasmine
        window.onload();
    });
});
