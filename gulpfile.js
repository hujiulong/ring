var gulp = require('gulp');
var uglify = require("gulp-uglify");

gulp.task('js', function () {
	return gulp.src('js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'))
});