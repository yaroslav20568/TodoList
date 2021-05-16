let preprocessor = 'sass';
const { src, dest, parallel, series, watch} = require('gulp'),
    browserSync  = require('browser-sync').create(),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify-es').default,
    sass         = require('gulp-sass'),
    less         = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss     = require('gulp-clean-css'),
    imagemin     = require('gulp-imagemin'),
    newer        = require('gulp-newer'),
    del          = require('del'),
    ttf2woff     = require('gulp-ttf2woff'),
    ttf2woff2    = require('gulp-ttf2woff2'),
    fonter       = require('gulp-fonter'),
    fs           = require('fs');


function browsersync() {
    browserSync.init({
        server: { baseDir:'app/' },
        notify: false, //убираем надпись в правом вверхнем углу при F5
        online: true //ставим онлайн сеть
    })
}

function scripts() {
    return src([
        //'node_modules/jquery/dist/jquery.min.js',
        'app/js/app.js' // идёт в конце т.к. используем фремворки или библиотеки
    ])
    .pipe(concat('app.min.js')) //конкатинируем в новый файл app.min.js
    .pipe(uglify()) //сжимаем в одну строку
    .pipe(dest('app/js/')) //выгрузка в папку js
    .pipe(browserSync.stream())
}

function styles() {
    return src('app/' + preprocessor + '/main.' + preprocessor + '')
    .pipe(eval(preprocessor)())
    .pipe(sass())
    .pipe(concat('app.css'))
    .pipe(autoprefixer({overrideBrowserslist: ['last 10 versions'], grid: true}))
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream())

    .pipe(concat('app.min.css'))
    .pipe(autoprefixer({overrideBrowserslist: ['last 10 versions'], grid: true}))
    .pipe(cleancss({level: {1: {specialComments: 0}}/*, format: 'beautify'*/}))
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream())
}

function fonts() {
    src('app/fonts/src/*.ttf')
    .pipe(ttf2woff())
    .pipe(dest('app/fonts/dest'))
    return src('app/fonts/src/*.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('app/fonts/dest'))
}

function otf2ttf() {
    return src('app/fonts/src/*.otf')
    .pipe(fonter({
        formats: ['ttf']
    }))
    .pipe(dest('app/fonts/src'))
}

function fontsStyle() {
    let file_content = fs.readFileSync('app' + '/sass/fonts.sass');
    if (file_content == '') {
        fs.writeFile('app' + '/sass/fonts.sass', '', cb);
        return fs.readdir('dist/fonts/', function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile('app' + '/sass/fonts.sass', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}
    
function cb() { }

function images() {
    return src('app/images/src/**/*')
    .pipe(newer('app/images/dest')) //сравнение файлов, если они оптимизированы, то оптимизации не будет
    .pipe(imagemin())
    .pipe(dest('app/images/dest'))
}

function cleanimg() {
    return del('app/images/dest**/*, {force: true}') //удаляем форсировано папку
}

function cleandist() {
    return del('dist/**/*', {force: true})
}

function buildcopy() {
    return src([
        'app/css/**/*.css',
        'app/js/**/*.js',
        'app/images/dest/**/*',
        'app/fonts/dest/**/*',
        'app/**/*.html'
    ], {base: 'app'}) //base-откуда берём
    .pipe(dest('dist'))
}

function startwatch() {
    watch('app/**/' + preprocessor + '/**/*', styles);
    watch(['app/**/*.js', '!app/&&/*.min.js'], scripts); //выборка, !-не включает *.min.js
    watch('app/**/*.html').on('change', browserSync.reload); //при изменении вызываем reload 
    watch('app/images/src/**/*', images)
}



//экспорт функций в таск
exports.browsersync = browsersync; //экспорт, название таска = функция
exports.scripts = scripts;
exports.styles = styles;
exports.fonts = fonts;
exports.otf2ttf = otf2ttf;
exports.fontsStyle = fontsStyle;
exports.images = images;
exports.cleanimg = cleanimg;
exports.build = series(styles, scripts, images, buildcopy);

//экспорт функций в дефолтный таск, можно выполнить все задачи параллельно
exports.default = parallel(cleandist, styles, fonts, otf2ttf, fontsStyle, scripts, browsersync, startwatch);