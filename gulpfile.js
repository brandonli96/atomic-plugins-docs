var gulp = require('gulp'); 
var jsdoc = require('gulp-jsdoc');
var git = require('gulp-git');
var del = require('del');
var Q = require('q');
var exec = require('child_process').exec;

var repos = [
	"https://github.com/ludei/cocoon-common",
	"https://github.com/CocoonIO/cocoon-canvasplus",
	"https://github.com/ludei/atomic-plugins-inapps",
	"https://github.com/ludei/atomic-plugins-googleplaygames",
	"https://github.com/ludei/atomic-plugins-ads",
	"https://github.com/ludei/atomic-plugins-facebook",
	"https://github.com/ludei/atomic-plugins-share",
	"https://github.com/ludei/atomic-plugins-notifications",
	"https://github.com/ludei/atomic-plugins-gamecenter",
	"https://github.com/ludei/atomic-plugins-multiplayer",
	"https://github.com/ludei/atomic-plugins-social"
];

gulp.task('clean', function () {

	return del([
    	'srcs',
    	'repos',
    	'dist'
	]);

});

gulp.task('clone', ['clean'], function() {
	var deferred = Q.defer();
	var count = repos.length;

	for (var i = 0; i < repos.length; i++) {
		var index = repos[i].lastIndexOf("/");
		var name = repos[i].substring(index);

		git.clone(repos[i], {args: './repos/' + name, quiet: true}, function(err) {
			if (err)
		    	deferred.reject(new Error(err));

		    count--;	   	
		   	if (count === 0) {
	    		deferred.resolve();
	    	}
		});
	}

    return deferred.promise;
});

gulp.task('copy-js', ['clone'], function() {
	var all_srcs = [];
	for (var i = 0; i < repos.length; i++) {
		var index = repos[i].lastIndexOf("/");
		var name = repos[i].substring(index);

		var srcs = repos.map(function(repo) {
			var index = repo.lastIndexOf("/");
			var name = repo.substring(index);

			return "./repos/" + name + "/src/js/**/*.js";
		});

		all_srcs = all_srcs.concat(srcs);
		all_srcs.push('./src/js/**/*.js');
	}

	return gulp.src(all_srcs).pipe(gulp.dest('./srcs/js/'));
});

gulp.task('doc-js', ['copy-js'], function() {
    var config = require('./doc_template/js/jsdoc.conf.json');

    var infos = {
        plugins: config.plugins
    }

    var templates = config.templates;
    templates.path = 'doc_template/js';

	return gulp.src("srcs/js/**/*.js")
    	.pipe(jsdoc.parser(infos))
    	.pipe(jsdoc.generator('dist/doc/js', templates));
});

// gulp.task('doc-android', ['clone'], function() {
// 	var deferred = Q.defer();
// 	var count = repos.length;

// 	var srcs = [];
// 	for (var i = 0; i < repos.length; i++) {
// 		var index = repos[i].lastIndexOf("/");
// 		var name = repos[i].substring(index);
	
// 		srcs.push('../../repos/' + name + '/src/atomic/android');
		
// 	    count--;	   	
// 	   	if (count === 0) {
// 	   		exec('mkdir -p ./dist/doc/android; cd doc_template/android; ( cat config ; echo "INPUT=' + srcs.join(" ") + '"; echo "FILE_PATTERNS=*.java" ) | doxygen -', function (err, stdout, stderr) {
// 		    	if (err)
// 		    		deferred.reject(new Error(stderr));
// 		    	else
// 		    		deferred.resolve();
// 		  	});
//     	}
// 	}

// 	return deferred.promise;
// });

// gulp.task('doc-ios', ['clone'], function() {
// 	var deferred = Q.defer();
// 	var count = repos.length;

// 	var srcs = [];
// 	for (var i = 0; i < repos.length; i++) {
// 		var index = repos[i].lastIndexOf("/");
// 		var name = repos[i].substring(index);
	
// 		srcs.push('../../repos/' + name + '/src/atomic/ios');
		
// 	    count--;	   	
// 	   	if (count === 0) {
// 	   		exec('mkdir -p ./dist/doc/ios; cd doc_template/ios; ( cat config ; echo "INPUT=' + srcs.join(" ") + '"; echo "FILE_PATTERNS=*.h" ) | doxygen -', function (err, stdout, stderr) {
// 		    	if (err)
// 		    		deferred.reject(new Error(stderr));
// 		    	else
// 		    		deferred.resolve();
// 		  	});
//     	}
// 	}

// 	return deferred.promise;
// });

// gulp.task('doc-cpp', ['clone'], function() {
// 	var deferred = Q.defer();
// 	var count = repos.length;

// 	var srcs = [];
// 	for (var i = 0; i < repos.length; i++) {
// 		var index = repos[i].lastIndexOf("/");
// 		var name = repos[i].substring(index);
	
// 		srcs.push('../../repos/' + name + '/src/cpp');
		
// 	    count--;	   	
// 	   	if (count === 0) {
// 	   		exec('mkdir -p ./dist/doc/cpp; cd doc_template/cpp; ( cat config ; echo "INPUT=' + srcs.join(" ") + '"; echo "FILE_PATTERNS=*.h" ) | doxygen -', function (err, stdout, stderr) {
// 		    	if (err)
// 		    		deferred.reject(new Error(stderr));
// 		    	else
// 		    		deferred.resolve();
// 		  	});
//     	}
// 	}

// 	return deferred.promise;
// });

gulp.task('doc', ["doc-js"]);

gulp.task('default', ['doc']);
