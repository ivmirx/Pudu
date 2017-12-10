var Path = require('path'),
	File = require('file'),
	Recursive = require('recursive-readdir');

var config = require('./config'),
	utils = require('./utils'),
	roots = require('./roots');

exports.load = load;

function load(onLoaded) {
	var localizedSharedItems = {};
	addLocaleRoots(localizedSharedItems);

	Recursive(roots.SHARED, config.ignoredFiles, function(err, files) {
		for (var i = files.length - 1; i >= 0; i--) {
			var filepath = files[i];
			var extname = Path.extname(filepath);
			var item = utils.loadAndConvertFile(filepath, extname);

			// locale-specific files, for example: menu~es.html
			var locale = config.mainLocale;
			var parts = Path.basename(filepath, extname).split('~');

			if (parts.length == 2) {
				locale = parts[1];
			}
			else if (parts.length > 2) {
				console.error('Wrong file name: ' + filepath);
			}

			// object nesting reflects the directory structure
			var directory = Path.dirname(filepath);
			var relativeDirectory = File.path.relativePath(roots.SHARED, directory);

			var keys = utils.keysFromDirectory(relativeDirectory);
			keys.unshift(config.sharedPrefix);

			var parent = utils.getNestedItem(localizedSharedItems[locale], keys);
			var name = Path.basename(filepath, extname);

			if (parent[name] != null) {
				console.error('Trying to assign shared item "' + filepath + '" to an occupied key with the same name!');
				process.exit(1);
			}

			parent[parts[0]] = item;
		}

		// copy texts from the main locale if some trasnlations are missing
		for (var i = config.additionalLocales.length - 1; i >= 0; i--) {
			var locale = config.additionalLocales[i];
			utils.fillNulls(localizedSharedItems[config.mainLocale], localizedSharedItems[locale]);
		}

		// console.log(localizedSharedItems);
		onLoaded(localizedSharedItems);
	});
}

function addLocaleRoots(object) {
	object[config.mainLocale] = {};

	for (var i = config.additionalLocales.length - 1; i >= 0; i--) {
		var locale = config.additionalLocales[i];
		object[locale] = {};
	}
}
