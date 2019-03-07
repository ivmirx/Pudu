var Fs = require('fs'),
	Path = require('path'),
	Recursive = require('recursive-readdir'),
	CleanCss = require('clean-css');

var config = require('./config'),
	utils = require('./utils');

var cleanCss = new CleanCss();
var cssExtension = '.css';
var minExtension = '.min.css';
var origExtension = '.ORIG.css';

exports.minify = minify;
exports.unminify = unminify;

function minify() {
	Recursive(config.outputRootDirectory, function(err, files) {
		for (var i = files.length - 1; i >= 0; i--) {
			var filepath = files[i];
			if (Path.extname(filepath) !== cssExtension || isMinified(filepath)) {
				continue;
			}

			var name = Path.basename(filepath, cssExtension);
			var directory = Path.dirname(filepath);

			var minFilename = name + minExtension;
			var minFilepath = Path.join(directory, minFilename);

			var origFilename = name + origExtension;
			var origFilepath = Path.join(directory, origFilename);

			if (Fs.existsSync(minFilepath) || Fs.existsSync(origFilepath)) {
				console.log('Already minified, skipping: ' + filepath);
				continue;
			}

			Fs.renameSync(filepath, origFilepath);

			if (Fs.existsSync(filepath) || (Fs.existsSync(origFilepath) == false)) {
				console.error('Can\'t rename the original: ' + filepath);
				process.exit(1);
			}

			var original = utils.loadFile(origFilepath);
			if (original == null) {
				console.error('Can\'t read the original file: ' + origFilepath);
				process.exit(1);
			}

			var minified = cleanCss.minify(original).styles;
			Fs.writeFileSync(filepath, minified);
			console.log('Minified: ' + filepath);
		}
	});
}

function unminify() {
	Recursive(config.outputRootDirectory, function(err, files) {
		for (var i = files.length - 1; i >= 0; i--) {
			var filepath = files[i];

			var origEnding = filepath.substr(-origExtension.length);
			if (origEnding !== origExtension) {
				continue;
			}

			var name = Path.basename(filepath, origExtension);
			var directory = Path.dirname(filepath);

			var cssFilename = name + cssExtension;
			var cssFilepath = Path.join(directory, cssFilename);

			if (Fs.existsSync(cssFilepath)) {
				Fs.unlinkSync(cssFilepath);
			}

			Fs.renameSync(filepath, cssFilepath);

			if (Fs.existsSync(filepath) || (Fs.existsSync(cssFilepath) == false)) {
				console.error('Can\'t restore the original file: ' + filepath);
				process.exit(1);
			}

			console.log('Restored: ' + cssFilepath);
		}
	});
}

function isMinified(filepath) {
	var minEnding = filepath.substr(-minExtension.length);
	if (minEnding === minExtension) {
		return true;
	}

	var origEnding = filepath.substr(-origExtension.length);
	if (origEnding === origExtension) {
		return true;
	}

	return false;
}
