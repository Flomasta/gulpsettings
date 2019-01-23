var gulp         = require('gulp'), // Подключаем Gulp
    sass         = require('gulp-sass'), //Подключаем Sass пакет,
    browserSync  = require('browser-sync'), // Подключаем Browser Sync
    concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления


gulp.task('sass', function(){ // Создаем таск Sass
    return gulp.src('app/sass/**/*.scss') // Берем источник
        .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: false })) // Создаем префиксы
        // .pipe(cssnano()) //сжимаем css
        .pipe(gulp.dest('app/css')); // Выгружаем результат в папку app/css

});

gulp.task('c-libs', function() {
    return gulp.src('app/css/libs.css') // Выбираем файл для минификации
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
        'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
    ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});



gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync.init({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: './app'// Директория для сервера - app
        },
        // port: 8080,
        open: true,
        notify: false // Отключаем уведомления
    });
});

gulp.task('watch',  function() {
    gulp.watch('app/sass/**/*.scss',  gulp.series('sass')); // Наблюдение за sass файлами
    gulp.watch('app/*.html').on('change', browserSync.reload);
    gulp.watch('app/*.js').on('change', browserSync.reload);
    gulp.watch('app/css/**/*.css').on('change', browserSync.stream); // Обновляем CSS на странице при изменении

    // Наблюдение за другими типами файлов
});

gulp.task('clean', function() {
    return del('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('clear', function () {
    return cache.clearAll();
})

gulp.task('css-libs', gulp.series('sass','c-libs'));

gulp.task('build', function () {
    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
        'app/css/main.css'
        // , 'app/css/libs.min.css'
    ])
        .pipe(gulp.dest('dist/css'))

    var buildFonts = gulp.src('app/fonts/**/*.woff') // Переносим шрифты в продакшен
        .pipe(gulp.dest('dist/fonts'))
    //
    // var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
    //     .pipe(gulp.dest('dist/js'))

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('dist'));
});


gulp.task('default', gulp.parallel('browser-sync','sass','watch'));
gulp.task('building',gulp.series('clean','sass','img','build'));
