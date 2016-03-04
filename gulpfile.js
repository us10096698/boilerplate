'use strict';

var gulp           = require('gulp-help')(require('gulp')),
    $              = require('gulp-load-plugins')(),
    server         = require( __dirname + '/src/server/app'),
    runSequence    = require('run-sequence'),
    del            = require('del'),
    wiredep        = require('wiredep').stream,
    Karma          = require('karma').Server,
    browserSync    = require('browser-sync').create(),
    mainBowerFiles = require('main-bower-files');

// ************** Tasks **********************

gulp.task('start', 'Start server', start);
gulp.task('stop', 'Stop server', stop);
gulp.task('bower', 'Install Bower dependencies', bower);
gulp.task('clean', 'Remove published client-side files',  clean);
gulp.task('copyBowerDep', 'Publish Bower main files', copyBowerDep);
gulp.task('copyAssets', 'Copy client-side files', copyAssets);
gulp.task('compileCss', 'Compile SASS files', compileCss);
gulp.task('compileJs', 'Compile Javascript files', compileJs);
gulp.task('compileIndex', 'Compile index.html', compileIndex);
gulp.task('browser-sync', 'Watch source files and reload browser automatically', syncBrowser);
gulp.task('protractor', 'Run Protractor', ['webdriver_update'], runProtractor);
gulp.task('webdriver_update', 'Update WebDriver', $.protractor.webdriver_update);
gulp.task('unit:client', 'Execute client-side unit tests (Karma)', ['karma-build'], runKarma);
gulp.task('karma-build', 'Update Karma configuration', karmaBuild);
gulp.task('unit:server', 'Execute server-side unit tests (Jasmine)', runJasmine);
gulp.task('lint', 'Execute ESLint analysis', lint);
gulp.task('default', 'Run default task', ['browser-sync']);

// *************** Task Chain ********************

gulp.task('build', 'Publish client-side files', function(done) {
  runSequence('clean', ['copyAssets', 'compileJs', 'copyBowerDep', 'compileCss'], 'compileIndex', done);
});

gulp.task('alltest', 'Execute all tests', function(done) {
  runSequence('unit', 'e2e', done);
});

gulp.task('e2e', 'Execute e2e tests (Protractor)', function(done) {
  runSequence('start', 'protractor', 'stop', done);
});

gulp.task('unit', 'Execute overall unit tests', function(done) {
  runSequence('unit:server', 'unit:client', done);
});

// ***************** Implementaions *********************

function start(done) {
  server.start(done);
}

function stop() {
  server.stop();
}

function clean(done) {
  return del( __dirname + '/public', done);
}

function bower() {
  return $.bower();
}

function copyBowerDep() {
  return gulp.src(mainBowerFiles(), {base: __dirname + '/bower_components'})
    .pipe(gulp.dest( __dirname + '/public/lib' ));
}

function copyAssets() {
  return gulp.src([
    __dirname + '/src/client/**',
    '!' + __dirname + '/src/client/js{,/**}',
    '!' + __dirname + '/src/client/sass{,/**}',
    '!' + __dirname + '/src/client/index.html'
  ])
  .pipe(gulp.dest( __dirname + '/public'))
  .pipe(browserSync.stream());
}

function compileJs() {
  return gulp.src(__dirname + '/src/client/js/**/*.js')
    .pipe(isProduction() ? $.stripDebug() : $.util.noop())
    .pipe(isProduction() ? $.uglify() : $.util.noop())
    .pipe(gulp.dest(__dirname + '/public/js/'))
    .pipe(isProduction() ? $.util.noop() : browserSync.stream());
}

function compileCss() {
  return gulp.src( __dirname + '/src/client/sass/**/*.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe(isProduction() ? $.minifyCss() : $.util.noop())
    .pipe(gulp.dest( __dirname + '/public/css/'))
    .pipe(isProduction() ? $.util.noop() : browserSync.stream());
}

function compileIndex() {
  return gulp.src( __dirname + '/src/client/index.html')
    .pipe($.inject(gulp.src([
      __dirname + '/public/lib/**/*.js',
      __dirname + '/public/lib/**/*.css',
      __dirname + '/public/js/**/*.js',
      __dirname + '/public/css/**/*.css'
    ]), { ignorePath: '../../public', relative: true }))
    .pipe(gulp.dest( __dirname + '/public/'));
}

function syncBrowser() {
  browserSync.init({
    proxy: 'http://localhost:3000',
    port: 4000,
    open: false
  });

  $.nodemon({
    script: __dirname + '/src/scripts/start.js',
    ext: 'js',
    watch: ['/src/server/'],
    env: { 'NODE_ENV': 'development' }
    });

  gulp.watch( __dirname + '/src/client/sass/**/*.scss', ['compileCss']);
  gulp.watch([
    __dirname + '/src/client/**',
    '!' + __dirname + '/src/client/js{,/**}',
    '!' + __dirname + '/src/client/sass{,/**}',
    '!' + __dirname + '/src/client/index.html'
  ], ['copyAssets']);
  gulp.watch( __dirname + '/src/client/index.html', ['compileIndex']);
  gulp.watch( __dirname + '/src/client/js/**/*.js', ['compileJs']);
  gulp.watch( __dirname + '/public/**/*.html').on('change', browserSync.reload);
}

function runProtractor() {
  return gulp.src([ __dirname + '/test/e2e/**/*-spec.js'])
    .pipe($.protractor.protractor({
      configFile: __dirname + '/test/e2e/protractor.conf.js'
    }));
}

function runJasmine() {
  return gulp.src( __dirname + '/test/unit/server/**/*-spec.js')
    .pipe($.jasmine());
}

function runKarma(done) {
  new Karma({
    configFile: __dirname + '/test/unit/client/karma.conf.js'
  }, done).start();
}

function karmaBuild() {
  return gulp.src( __dirname + '/test/unit/client/karma.conf.js')
    .pipe(wiredep({
      fileTypes: {
        js: {
          block: /(([ \t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
          detect: {
            js: /['\']([^'\']+\.js)['\'],?/gi,
            css: /['\']([^'\']+\.css)['\'],?/gi
          },
          replace: {
            js: '"{{filePath}}",',
            css: '"{{filePath}}",'
          }
        }
      },
      ignorePath: '../../../'
    }))
    .pipe(gulp.dest( __dirname + '/test/unit/client/'));
}

function lint() {
  return gulp.src(__dirname + '/src/**/*.js')
  .pipe($.eslint())
  .pipe($.eslint.format())
  .pipe($.eslint.failAfterError());
}

function isProduction() {
  if (process.env.NODE_ENV == 'production') {
    return true;
  }
  return false;
}

