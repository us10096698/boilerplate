'use strict';

module.exports = function(config) {
  config.set({
    basePath: '../../../',
    frameworks: ['jasmine'],
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      // endbower
      'bower_components/angular-mocks/angular-mocks.js',
      'public/js/**/*.js',
      'test/unit/client/**/*-spec.js'
    ],
    exclude: [
    ],
    preprocessors: {
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true,
    concurrency: Infinity
  });
};
