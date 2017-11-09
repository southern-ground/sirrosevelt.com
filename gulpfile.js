var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    runSequence = require('run-sequence'),
    pkg = require('./package.json'),
    dirs = pkg['sir-rosevelt-configs'].directories,
    commands = pkg['sir-rosevelt-configs'].commands,
    config = {data: {name: 'prod'}},
    browserSync = require('browser-sync'),
    print = require('gulp-print'),
    sass = require('gulp-sass'),
    render = require('gulp-nunjucks-render'),
    shell = require('gulp-shell'),
    data = require('gulp-data'),
    uglify = require('gulp-uglify'),
    pump = require('pump');

var getData = function (argv) {

    var server = argv.build || "stage",
        data = pkg['sir-rosevelt-configs'].servers[server];

    // Append the lyrics info:
    data.lyrics = pkg['sir-rosevelt-configs'].lyrics;
    // Append the external links:
    data.links = pkg['sir-rosevelt-configs'].externalLinks;
    // Add the purchase links:
    data.purchaseLinks = pkg['sir-rosevelt-configs'].purchaseLinks;

    data.externalLinks = pkg['sir-rosevelt-configs'].externalLinks;

    return {
        data: data
    };
};

gulp.task('compress', function (done) {

    if (config.data.name === "dev") {
        // Pass through; don't compress
        return gulp.src(dirs.src + '/js/**/*.js')
            .pipe(gulp.dest(dirs.dist + '/js/'));
    } else {
        pump([
                gulp.src(dirs.src + '/js/**/*.js'),
                uglify(),
                gulp.dest(dirs.dist + '/js/')
            ],
            done
        );
    }

});

gulp.task('clean', function (done) {
    require('del')([
        dirs.dist
    ]).then(function () {
        done();
    });
});

gulp.task('copy', function (done) {
    runSequence([
            'copy:jquery',
            'copy:normalize',
            'copy:bootstrap',
            'copy:iphone-inline-video',
            'copy:underscore',
            'copy:sundry'],
        'compress',
        done);
});

gulp.task('copy:jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
        .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
        .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:bootstrap', function () {
    return gulp.src(['node_modules/bootstrap/dist/css/bootstrap.min.css', 'node_modules/bootstrap/dist/css/bootstrap.min.css.map'])
        .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:normalize', function () {
    return gulp.src('node_modules/normalize.css/normalize.css')
        .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:underscore', function () {
    return gulp.src(['node_modules/underscore/underscore-min.js', 'node_modules/underscore/underscore-min.map'])
        .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:iphone-inline-video', function () {
    return gulp.src(['node_modules/iphone-inline-video/dist/iphone-inline-video.browser.js'])
        .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:sundry', function () {
    return gulp.src([
        // Copy all files
        dirs.src + '/**/*',
        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/js/**/*.js',
        '!' + dirs.src + '/js',
        '!' + dirs.src + '/sass/**/*.scss',
        '!' + dirs.src + '/sass',
        '!' + dirs.src + '/doc/**/*.*',
        '!' + dirs.src + '/doc',
        '!' + dirs.src + '/**/*.html'
    ], {
        // Include hidden files by default
        dot: false
    }).pipe(gulp.dest(dirs.dist));
});

gulp.task('sass', function () {

    var options = {};

    if (config.data.name !== 'dev') {
        options.outputStyle = 'compressed';
    }

    console.log(options);

    return gulp.src([dirs.src + '/sass/**/*.scss', '!' + dirs.src + '/sass/**/_*.scss'])
        .pipe(print(function (filepath) {
            return "\tsassing " + filepath;
        }))
        .pipe(sass(options))
        .pipe(gulp.dest(dirs.src + '/css'));
});

gulp.task('serve', function () {

    browserSync.init({server: "./dist"});

    gulp.watch([dirs.src + "/**/*.html", dirs.src + "/**/*.js", dirs.src + "/sass/**/*.scss", dirs.src + "/img/*.*"], function () {
        runSequence(['build'], browserSync.reload);
    });

    gulp.watch([dirs.dest + "/js/**/*.js", dirs.dest + "/css/**/*.css", dirs.dest + "/img/**/*.*"], browserSync.reload());

});

gulp.task('render', function (done) {

    if (!config) { // called by itself, possibly?
        config = getData(require('yargs').argv);
    }

    return gulp.src([dirs.src + '/**/*.html', '!' + dirs.src + '/rev.html'])
        .pipe(print(function (filepath) {
            return "\tRendering " + filepath;
        }))
        .pipe(data(function () {
            return config;
        }))
        .pipe(render())
        .pipe(gulp.dest(dirs.dist));
});

gulp.task('git-revision', shell.task(commands.gitRevision));

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('build', function (done) {

    config = getData(require('yargs').argv);

    runSequence(
        ['git-revision'],
        ['clean', 'sass'],
        ['render'],
        ['copy'],
        done);
});

gulp.task('default', function () {

    config = getData(require('yargs').argv);

    runSequence(['build'], 'serve', function () {
        console.log('Default likes to watch');
    });
});

