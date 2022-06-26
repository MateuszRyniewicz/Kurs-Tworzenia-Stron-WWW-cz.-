const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sasnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const ugliy = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const kit = require('gulp-kit');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const paths = {
	html: './html/**/*.kit',
	sass: './src/sass/**/*.scss',
	js: './src/js/**/*.js',
	dist: './dist',
	img: './src/img/*',
	sassDest: './dist/css',
	jsDest: './dist/js',
	imgDest: './dist/img',
};

function sassCompiller(done) {
	src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(sasnano())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.sassDest));

	done();
}

function javaScript(done) {
	src(paths.js)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(ugliy())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.jsDest));
	done();
}

function convertImage(done) {
	src(paths.img)
		.pipe(imagemin())

		.pipe(dest(paths.imgDest));
	done();
}

function handleKit(done) {
	src(paths.html).pipe(kit()).pipe(dest('./'));
	done();
}

function startBrowserSyn(done) {
	browserSync.init({
		server: {
			baseDir: './',
		},
	});
	done();
}

function clearStaff(done) {
	return src(paths.dist, { read: false }).pipe(clean());
	done();
}

function watchForChanges(done) {
	watch('./*.html').on('change', reload);
	watch(
		[paths.html, paths.sass, paths.js],
		parallel(handleKit, sassCompiller, javaScript)
	).on('change', reload);
	watch(paths.img, convertImage).on('change', reload);
	done();
}

const startFunction = parallel(
	handleKit,
	sassCompiller,
	javaScript,
	convertImage
);
exports.clearStaff = clearStaff;
exports.default = series(startFunction, startBrowserSyn, watchForChanges);
